import { StoreProfile, Customer, Transaction, ReminderJob, AuditLog } from '../types';

export interface IStoreRepository {
  getProfile(): Promise<StoreProfile>;
  updateProfile(updates: Partial<StoreProfile>): Promise<StoreProfile>;
  verifyPin(pin: string): Promise<boolean>;
  updatePin(newPin: string): Promise<void>;
}

export interface ICustomerRepository {
  findAll(filter?: { search?: string; status?: 'ALL' | 'DUE' | 'SETTLED' | 'ADVANCE'; sort?: string }): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  findByPhone(phone: string): Promise<Customer | null>;
  create(customer: Customer): Promise<Customer>;
  update(id: string, updates: Partial<Customer>): Promise<Customer | null>;
  updateBalance(id: string, newBalance: number, timestamp: string): Promise<Customer | null>;
  delete(id: string): Promise<boolean>;
}

export interface ITransactionRepository {
  findAll(filter?: { customerId?: string; type?: 'ALL' | 'CREDIT' | 'PAYMENT'; search?: string }): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  create(transaction: Transaction): Promise<Transaction>;
  deleteByCustomerId(customerId: string): Promise<number>;
}

export interface IReminderRepository {
  findAll(status?: string): Promise<ReminderJob[]>;
  findById(id: string): Promise<ReminderJob | null>;
  create(job: ReminderJob): Promise<ReminderJob>;
  update(id: string, updates: Partial<ReminderJob>): Promise<ReminderJob | null>;
  deleteByCustomerId(customerId: string): Promise<number>;
  cancelScheduledForCustomer(customerId: string): Promise<number>;
}

export interface IAuditRepository {
  findAll(limit?: number): Promise<AuditLog[]>;
  create(log: AuditLog): Promise<AuditLog>;
}
