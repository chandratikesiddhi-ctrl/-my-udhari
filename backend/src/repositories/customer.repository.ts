import { db } from '../config/database';
import { Customer } from '../types';
import { ICustomerRepository } from './interfaces';
import { extractDigits } from '../utils/formatters';

export class CustomerRepository implements ICustomerRepository {
  async findAll(filter?: { search?: string; status?: 'ALL' | 'DUE' | 'SETTLED' | 'ADVANCE'; sort?: string }): Promise<Customer[]> {
    const data = db.getData();
    let list = data.customers.filter((c) => !c.isDeleted);

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          extractDigits(c.phone).includes(extractDigits(q))
      );
    }

    if (filter?.status && filter.status !== 'ALL') {
      if (filter.status === 'DUE') {
        list = list.filter((c) => c.balance > 0);
      } else if (filter.status === 'SETTLED') {
        list = list.filter((c) => c.balance === 0);
      } else if (filter.status === 'ADVANCE') {
        list = list.filter((c) => c.balance < 0);
      }
    }

    if (filter?.sort) {
      if (filter.sort === 'highest_due') {
        list = [...list].sort((a, b) => b.balance - a.balance);
      } else if (filter.sort === 'name') {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      } else if (filter.sort === 'recent') {
        list = [...list].sort(
          (a, b) => new Date(b.lastTransactionDate).getTime() - new Date(a.lastTransactionDate).getTime()
        );
      }
    }

    return list;
  }

  async findById(id: string): Promise<Customer | null> {
    const data = db.getData();
    const cust = data.customers.find((c) => c.id === id && !c.isDeleted);
    return cust || null;
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    const data = db.getData();
    const digits = extractDigits(phone);
    if (!digits) return null;

    const cust = data.customers.find((c) => !c.isDeleted && extractDigits(c.phone).endsWith(digits));
    return cust || null;
  }

  async create(customer: Customer): Promise<Customer> {
    return db.mutate((data) => {
      data.customers.unshift(customer);
      return customer;
    });
  }

  async update(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    return db.mutate((data) => {
      const index = data.customers.findIndex((c) => c.id === id);
      if (index === -1) return null;

      data.customers[index] = {
        ...data.customers[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return data.customers[index];
    });
  }

  async updateBalance(id: string, newBalance: number, timestamp: string): Promise<Customer | null> {
    return db.mutate((data) => {
      const index = data.customers.findIndex((c) => c.id === id);
      if (index === -1) return null;

      data.customers[index] = {
        ...data.customers[index],
        balance: newBalance,
        lastTransactionDate: timestamp,
        updatedAt: new Date().toISOString(),
      };
      return data.customers[index];
    });
  }

  async delete(id: string): Promise<boolean> {
    return db.mutate((data) => {
      const index = data.customers.findIndex((c) => c.id === id);
      if (index === -1) return false;
      // Soft delete or filter
      data.customers.splice(index, 1);
      return true;
    });
  }
}

export const customerRepository = new CustomerRepository();
