import { customerRepository } from '../repositories/customer.repository';
import { transactionRepository } from '../repositories/transaction.repository';
import { reminderRepository } from '../repositories/reminder.repository';
import { auditRepository } from '../repositories/audit.repository';
import { storeRepository } from '../repositories/store.repository';
import { Customer, Transaction, JwtPayload } from '../types';
import { AppError } from '../utils/errors';
import { normalizePhone, extractDigits } from '../utils/formatters';

export class CustomerService {
  async listCustomers(filter?: {
    search?: string;
    status?: 'ALL' | 'DUE' | 'SETTLED' | 'ADVANCE';
    sort?: string;
  }): Promise<{ customers: Customer[]; totalOutstanding: number; activeDebtorsCount: number; settledCount: number }> {
    const customers = await customerRepository.findAll(filter);

    const allCustomers = await customerRepository.findAll();
    const totalOutstanding = allCustomers.reduce((sum, c) => (c.balance > 0 ? sum + c.balance : sum), 0);
    const activeDebtorsCount = allCustomers.filter((c) => c.balance > 0).length;
    const settledCount = allCustomers.filter((c) => c.balance === 0).length;

    return {
      customers,
      totalOutstanding,
      activeDebtorsCount,
      settledCount,
    };
  }

  async getCustomerById(id: string): Promise<Customer> {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw AppError.notFound('Customer not found');
    }
    return customer;
  }

  async createCustomer(
    data: {
      name: string;
      phone: string;
      initialBalance?: number;
      reminderEnabled?: boolean;
      reminderIntervalDays?: number;
      notes?: string;
    },
    user?: JwtPayload
  ): Promise<{ customer: Customer; initialTransaction?: Transaction }> {
    const digits = extractDigits(data.phone);
    const existing = await customerRepository.findByPhone(digits);
    if (existing) {
      throw AppError.duplicatePhone(`A customer with phone number ending in ${digits} already exists (${existing.name}).`);
    }

    const store = await storeRepository.getProfile();
    const customerId = `cust-${Date.now()}`;
    const now = new Date().toISOString();
    const openingBalance = Number(data.initialBalance || 0);

    const newCustomer: Customer = {
      id: customerId,
      storeId: store.id,
      name: data.name.trim(),
      phone: normalizePhone(data.phone),
      balance: openingBalance,
      reminderEnabled: data.reminderEnabled !== undefined ? data.reminderEnabled : true,
      reminderIntervalDays: data.reminderIntervalDays || store.reminderIntervalDays || 8,
      lastTransactionDate: now,
      createdAt: now,
      updatedAt: now,
      notes: data.notes?.trim(),
      avatarColor: 'bg-primary-container text-white',
    };

    const savedCustomer = await customerRepository.create(newCustomer);
    let initialTx: Transaction | undefined;

    // Create opening balance transaction if openingBalance != 0
    if (openingBalance !== 0) {
      const isCredit = openingBalance > 0;
      initialTx = {
        id: `tx-init-${Date.now()}`,
        storeId: store.id,
        customerId: savedCustomer.id,
        customerName: savedCustomer.name,
        type: isCredit ? 'CREDIT' : 'PAYMENT',
        amount: Math.abs(openingBalance),
        note: 'Opening balance',
        timestamp: now,
        formattedDate: 'Today',
        formattedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        createdBy: user?.role === 'Staff' ? 'Staff' : 'Owner',
        balanceAfter: openingBalance,
        createdAt: now,
      };

      await transactionRepository.create(initialTx);
    }

    await auditRepository.create({
      id: `log-${Date.now()}`,
      storeId: store.id,
      actor: user ? `${user.name} (${user.role})` : 'Store Admin',
      action: 'CREATE_CUSTOMER',
      entity: 'Customer',
      entityId: savedCustomer.id,
      timestamp: now,
      result: 'SUCCESS',
      details: `Created customer ${savedCustomer.name} (${savedCustomer.phone}) with initial balance ₹${openingBalance}`,
    });

    return { customer: savedCustomer, initialTransaction: initialTx };
  }

  async updateReminderPreference(
    id: string,
    data: { reminderEnabled?: boolean; reminderIntervalDays?: number },
    user?: JwtPayload
  ): Promise<Customer> {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw AppError.notFound('Customer not found');
    }

    const updated = await customerRepository.update(id, data);
    if (!updated) {
      throw AppError.notFound('Failed to update customer');
    }

    await auditRepository.create({
      id: `log-${Date.now()}`,
      storeId: customer.storeId,
      actor: user ? `${user.name} (${user.role})` : 'Store Admin',
      action: 'UPDATE_REMINDER_PREFERENCE',
      entity: 'Customer',
      entityId: id,
      timestamp: new Date().toISOString(),
      result: 'SUCCESS',
      details: `Updated reminder preference: enabled=${data.reminderEnabled}, interval=${data.reminderIntervalDays}`,
    });

    return updated;
  }

  async deleteCustomer(id: string, user?: JwtPayload): Promise<boolean> {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw AppError.notFound('Customer not found');
    }

    await customerRepository.delete(id);
    await transactionRepository.deleteByCustomerId(id);
    await reminderRepository.deleteByCustomerId(id);

    await auditRepository.create({
      id: `log-${Date.now()}`,
      storeId: customer.storeId,
      actor: user ? `${user.name} (${user.role})` : 'Store Admin',
      action: 'DELETE_CUSTOMER',
      entity: 'Customer',
      entityId: id,
      timestamp: new Date().toISOString(),
      result: 'SUCCESS',
      details: `Deleted customer ${customer.name} and related records`,
    });

    return true;
  }
}

export const customerService = new CustomerService();
