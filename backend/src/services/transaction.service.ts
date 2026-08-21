import { transactionRepository } from '../repositories/transaction.repository';
import { customerRepository } from '../repositories/customer.repository';
import { reminderRepository } from '../repositories/reminder.repository';
import { auditRepository } from '../repositories/audit.repository';
import { Transaction, Customer, TransactionType, JwtPayload } from '../types';
import { AppError } from '../utils/errors';
import { formatDisplayDate } from '../utils/formatters';

export class TransactionService {
  async recordTransaction(
    data: {
      customerId: string;
      type: TransactionType;
      amount: number;
      note?: string;
    },
    user?: JwtPayload
  ): Promise<{ transaction: Transaction; customer: Customer }> {
    const customer = await customerRepository.findById(data.customerId);
    if (!customer) {
      throw AppError.notFound('Customer not found');
    }

    const numAmount = Number(data.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw AppError.badRequest('Transaction amount must be a positive number');
    }

    const isCredit = data.type === 'CREDIT';
    const newBalance = isCredit ? customer.balance + numAmount : customer.balance - numAmount;

    const now = new Date();
    const nowIso = now.toISOString();
    const { formattedDate, formattedTime } = formatDisplayDate(nowIso);
    const creatorRole = user?.role === 'Staff' ? 'Staff' : 'Owner';

    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      storeId: customer.storeId,
      customerId: customer.id,
      customerName: customer.name,
      type: data.type,
      amount: numAmount,
      note: data.note?.trim(),
      timestamp: nowIso,
      formattedDate,
      formattedTime,
      createdBy: creatorRole,
      balanceAfter: newBalance,
      createdAt: nowIso,
    };

    // Save transaction
    const savedTx = await transactionRepository.create(transaction);

    // Update customer balance and lastTransactionDate
    const updatedCustomer = await customerRepository.updateBalance(customer.id, newBalance, nowIso);

    // PRD Section 11.5: Auto cancel pending scheduled reminders if customer balance becomes <= 0
    if (newBalance <= 0) {
      const cancelledCount = await reminderRepository.cancelScheduledForCustomer(customer.id);
      if (cancelledCount > 0) {
        await auditRepository.create({
          id: `log-${Date.now()}-cancel`,
          storeId: customer.storeId,
          actor: 'Automated 8-Day Engine',
          action: 'CANCEL_REMINDERS',
          entity: 'ReminderJob',
          entityId: customer.id,
          timestamp: nowIso,
          result: 'SUCCESS',
          details: `Auto-cancelled ${cancelledCount} pending scheduled reminders because balance is settled (₹${newBalance})`,
        });
      }
    }

    // Audit log
    await auditRepository.create({
      id: `log-${Date.now()}`,
      storeId: customer.storeId,
      actor: user ? `${user.name} (${user.role})` : `Store ${creatorRole}`,
      action: isCredit ? 'RECORD_CREDIT' : 'RECORD_PAYMENT',
      entity: 'Transaction',
      entityId: savedTx.id,
      timestamp: nowIso,
      result: 'SUCCESS',
      details: `${isCredit ? 'Gave credit' : 'Received payment'} of ₹${numAmount} for ${customer.name} (New Balance: ₹${newBalance})`,
    });

    return {
      transaction: savedTx,
      customer: updatedCustomer || { ...customer, balance: newBalance, lastTransactionDate: nowIso },
    };
  }

  async listTransactions(filter?: {
    customerId?: string;
    type?: 'ALL' | 'CREDIT' | 'PAYMENT';
    search?: string;
  }): Promise<Transaction[]> {
    return transactionRepository.findAll(filter);
  }
}

export const transactionService = new TransactionService();
