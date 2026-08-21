import { db } from '../config/database';
import { Transaction } from '../types';
import { ITransactionRepository } from './interfaces';

export class TransactionRepository implements ITransactionRepository {
  async findAll(filter?: { customerId?: string; type?: 'ALL' | 'CREDIT' | 'PAYMENT'; search?: string }): Promise<Transaction[]> {
    const data = db.getData();
    let list = [...data.transactions];

    if (filter?.customerId) {
      list = list.filter((t) => t.customerId === filter.customerId);
    }

    if (filter?.type && filter.type !== 'ALL') {
      list = list.filter((t) => t.type === filter.type);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.customerName.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q)) ||
          t.formattedDate.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async findById(id: string): Promise<Transaction | null> {
    const data = db.getData();
    return data.transactions.find((t) => t.id === id) || null;
  }

  async create(transaction: Transaction): Promise<Transaction> {
    return db.mutate((data) => {
      data.transactions.unshift(transaction);
      return transaction;
    });
  }

  async deleteByCustomerId(customerId: string): Promise<number> {
    return db.mutate((data) => {
      const initialCount = data.transactions.length;
      data.transactions = data.transactions.filter((t) => t.customerId !== customerId);
      return initialCount - data.transactions.length;
    });
  }
}

export const transactionRepository = new TransactionRepository();
