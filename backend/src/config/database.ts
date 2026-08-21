import fs from 'fs';
import path from 'path';
import { env } from './env';
import { logger } from './logger';
import { DatabaseSchema, StoreProfile, Customer, Transaction, ReminderJob, AuditLog } from '../types';
import { hashPin } from '../utils/crypto';

export class Database {
  private static instance: Database;
  private dbFilePath: string;
  private data: DatabaseSchema | null = null;
  private writeLock: Promise<void> = Promise.resolve();

  private constructor() {
    this.dbFilePath = path.join(env.DATA_DIR, 'udhari_db.json');
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Initialize database: ensure directory exists, load or seed data
   */
  public async init(): Promise<void> {
    try {
      if (!fs.existsSync(env.DATA_DIR)) {
        fs.mkdirSync(env.DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(this.dbFilePath)) {
        const raw = await fs.promises.readFile(this.dbFilePath, 'utf-8');
        this.data = JSON.parse(raw);
        logger.info('Database loaded from disk', { path: this.dbFilePath, customers: this.data?.customers.length });
      } else {
        logger.info('Database file not found, seeding initial data', { path: this.dbFilePath });
        this.data = this.getInitialSeedData();
        await this.persist();
      }
    } catch (err) {
      logger.error('Failed to initialize database, falling back to seed data', err);
      this.data = this.getInitialSeedData();
      await this.persist();
    }
  }

  /**
   * Get synchronous memory data
   */
  public getData(): DatabaseSchema {
    if (!this.data) {
      this.data = this.getInitialSeedData();
    }
    return this.data;
  }

  /**
   * Execute atomic state mutation with lock
   */
  public async mutate<T>(updater: (data: DatabaseSchema) => T | Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.writeLock = this.writeLock
        .then(async () => {
          try {
            const currentData = this.getData();
            const result = await updater(currentData);
            await this.persist();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
        .catch(reject);
    });
  }

  /**
   * Write data atomically to disk using temp file rename
   */
  private async persist(): Promise<void> {
    if (!this.data) return;
    const tempFile = `${this.dbFilePath}.${Date.now()}.tmp`;
    try {
      const json = JSON.stringify(this.data, null, 2);
      await fs.promises.writeFile(tempFile, json, 'utf-8');
      await fs.promises.rename(tempFile, this.dbFilePath);
    } catch (err) {
      logger.error('Failed to persist database file', err);
      if (fs.existsSync(tempFile)) {
        try {
          await fs.promises.unlink(tempFile);
        } catch {
          // ignore cleanup error
        }
      }
      throw err;
    }
  }

  /**
   * Reset database back to default initial seed
   */
  public async resetDemoData(): Promise<void> {
    await this.mutate((data) => {
      const fresh = this.getInitialSeedData();
      data.store = fresh.store;
      data.customers = fresh.customers;
      data.transactions = fresh.transactions;
      data.reminders = fresh.reminders;
      data.auditLogs = fresh.auditLogs;
      data.otpSessions = {};
    });
    logger.info('Database reset to initial demo data');
  }

  /**
   * Initial default seed data
   */
  public getInitialSeedData(): DatabaseSchema {
    const now = Date.now();
    const pinHash = hashPin(env.DEFAULT_PIN || '1234');

    const store: StoreProfile = {
      id: 'store-01',
      name: 'Kirana General Store',
      ownerName: 'Suresh Patel',
      phone: '+91 98765 00001',
      address: 'Shop No. 4, Market Road, Pune, Maharashtra',
      upiId: 'kiranastore@oksbi',
      pinHash,
      reminderIntervalDays: 8,
      autoRemindersEnabled: true,
      preferredChannel: 'WHATSAPP',
      userRole: 'Owner',
      lastBackupDate: new Date(now - 1000 * 60 * 60 * 24 * 9).toISOString(),
      createdAt: new Date(now - 1000 * 60 * 60 * 24 * 60).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const customers: Customer[] = [
      {
        id: 'cust-1',
        storeId: 'store-01',
        name: 'Anil Kumar',
        phone: '+91 98765 43210',
        balance: 850,
        reminderEnabled: true,
        reminderIntervalDays: 8,
        lastTransactionDate: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
        lastReminderSentDate: new Date(now - 1000 * 60 * 60 * 24 * 9).toISOString(),
        createdAt: '2026-07-01T08:00:00Z',
        updatedAt: new Date().toISOString(),
        notes: 'Regular customer from building A4',
        avatarColor: 'bg-primary-container text-white',
      },
      {
        id: 'cust-2',
        storeId: 'store-01',
        name: 'Rahul Sharma',
        phone: '+91 98234 11223',
        balance: 1250,
        reminderEnabled: true,
        reminderIntervalDays: 8,
        lastTransactionDate: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
        lastReminderSentDate: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
        createdAt: '2026-07-10T10:00:00Z',
        updatedAt: new Date().toISOString(),
        notes: 'Monthly provision credit account',
      },
      {
        id: 'cust-3',
        storeId: 'store-01',
        name: 'Amit Patel',
        phone: '+91 97654 33445',
        balance: -500, // Store owes customer / You will give
        reminderEnabled: false,
        reminderIntervalDays: 8,
        lastTransactionDate: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
        createdAt: '2026-07-15T11:00:00Z',
        updatedAt: new Date().toISOString(),
        notes: 'Advance deposit given for rice bag order',
      },
      {
        id: 'cust-4',
        storeId: 'store-01',
        name: 'Priya Singh',
        phone: '+91 99887 76655',
        balance: 0, // Settled
        reminderEnabled: true,
        reminderIntervalDays: 8,
        lastTransactionDate: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
        createdAt: '2026-07-18T09:30:00Z',
        updatedAt: new Date().toISOString(),
        notes: 'Cleared all dues on Friday',
      },
      {
        id: 'cust-5',
        storeId: 'store-01',
        name: 'Vikram Kumar',
        phone: '+91 98112 23344',
        balance: 3400,
        reminderEnabled: true,
        reminderIntervalDays: 8,
        lastTransactionDate: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
        lastReminderSentDate: new Date(now - 1000 * 60 * 60 * 24 * 10).toISOString(),
        createdAt: '2026-06-20T14:00:00Z',
        updatedAt: new Date().toISOString(),
        notes: 'Wholesale grains credit',
      },
      {
        id: 'cust-6',
        storeId: 'store-01',
        name: 'Ramesh Kumar',
        phone: '+91 98450 99881',
        balance: 450,
        reminderEnabled: true,
        reminderIntervalDays: 8,
        lastTransactionDate: new Date(now - 1000 * 60 * 120).toISOString(),
        createdAt: '2026-08-01T08:30:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cust-7',
        storeId: 'store-01',
        name: 'Suresh Traders',
        phone: '+91 98771 22334',
        balance: 2800,
        reminderEnabled: true,
        reminderIntervalDays: 8,
        lastTransactionDate: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
        createdAt: '2026-07-05T12:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cust-8',
        storeId: 'store-01',
        name: 'Anita Sharma',
        phone: '+91 97611 44556',
        balance: 80,
        reminderEnabled: true,
        reminderIntervalDays: 8,
        lastTransactionDate: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
        createdAt: '2026-08-05T09:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cust-9',
        storeId: 'store-01',
        name: 'Rajesh Gupta',
        phone: '+91 99123 55667',
        balance: 2100,
        reminderEnabled: true,
        reminderIntervalDays: 8,
        lastTransactionDate: new Date(now - 1000 * 60 * 60 * 24 * 12).toISOString(),
        createdAt: '2026-06-15T15:00:00Z',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cust-10',
        storeId: 'store-01',
        name: 'Meena Verma',
        phone: '+91 98334 77889',
        balance: 1870,
        reminderEnabled: true,
        reminderIntervalDays: 8,
        lastTransactionDate: new Date(now - 1000 * 60 * 60 * 24 * 9).toISOString(),
        createdAt: '2026-06-10T10:00:00Z',
        updatedAt: new Date().toISOString(),
      },
    ];

    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        storeId: 'store-01',
        customerId: 'cust-6',
        customerName: 'Ramesh Kumar',
        type: 'CREDIT',
        amount: 450,
        note: 'Daily Groceries & Tea',
        timestamp: new Date(now - 1000 * 60 * 120).toISOString(),
        formattedDate: 'Today',
        formattedTime: '10:30 AM',
        createdBy: 'Owner',
        balanceAfter: 450,
        createdAt: new Date(now - 1000 * 60 * 120).toISOString(),
      },
      {
        id: 'tx-2',
        storeId: 'store-01',
        customerId: 'cust-7',
        customerName: 'Suresh Traders',
        type: 'PAYMENT',
        amount: 1200,
        note: 'Cash payment received',
        timestamp: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
        formattedDate: 'Yesterday',
        formattedTime: '04:15 PM',
        createdBy: 'Owner',
        balanceAfter: 2800,
        createdAt: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
      },
      {
        id: 'tx-3',
        storeId: 'store-01',
        customerId: 'cust-8',
        customerName: 'Anita Sharma',
        type: 'CREDIT',
        amount: 80,
        note: 'Milk & Bread',
        timestamp: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
        formattedDate: '2 days ago',
        formattedTime: '09:00 AM',
        createdBy: 'Owner',
        balanceAfter: 80,
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        id: 'tx-4',
        storeId: 'store-01',
        customerId: 'cust-1',
        customerName: 'Anil Kumar',
        type: 'CREDIT',
        amount: 500,
        note: 'Groceries & Dairy',
        timestamp: new Date(now - 1000 * 60 * 60 * 24 * 4).toISOString(),
        formattedDate: '4 days ago',
        formattedTime: '10:30 AM',
        createdBy: 'Owner',
        balanceAfter: 850,
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 4).toISOString(),
      },
      {
        id: 'tx-5',
        storeId: 'store-01',
        customerId: 'cust-1',
        customerName: 'Anil Kumar',
        type: 'PAYMENT',
        amount: 200,
        note: 'Cash Payment',
        timestamp: new Date(now - 1000 * 60 * 60 * 24 * 8).toISOString(),
        formattedDate: '8 days ago',
        formattedTime: '04:15 PM',
        createdBy: 'Owner',
        balanceAfter: 350,
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 8).toISOString(),
      },
      {
        id: 'tx-6',
        storeId: 'store-01',
        customerId: 'cust-1',
        customerName: 'Anil Kumar',
        type: 'CREDIT',
        amount: 550,
        note: 'Rice 5kg Bag',
        timestamp: new Date(now - 1000 * 60 * 60 * 24 * 13).toISOString(),
        formattedDate: '13 days ago',
        formattedTime: '09:00 AM',
        createdBy: 'Owner',
        balanceAfter: 550,
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 13).toISOString(),
      },
      {
        id: 'tx-7',
        storeId: 'store-01',
        customerId: 'cust-2',
        customerName: 'Rahul Sharma',
        type: 'CREDIT',
        amount: 1250,
        note: 'Refined Oil & Spices',
        timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
        formattedDate: 'Today',
        formattedTime: '11:45 AM',
        createdBy: 'Owner',
        balanceAfter: 1250,
        createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'tx-8',
        storeId: 'store-01',
        customerId: 'cust-5',
        customerName: 'Vikram Kumar',
        type: 'CREDIT',
        amount: 3400,
        note: 'Wholesale Wheat 50kg bag',
        timestamp: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
        formattedDate: '1 week ago',
        formattedTime: '02:00 PM',
        createdBy: 'Owner',
        balanceAfter: 3400,
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
    ];

    const reminders: ReminderJob[] = [
      {
        id: 'rem-1',
        storeId: 'store-01',
        customerId: 'cust-1',
        customerName: 'Anil Kumar',
        phone: '+91 98765 43210',
        amount: 850,
        shopName: 'Kirana General Store',
        scheduledDate: new Date().toISOString(),
        status: 'SCHEDULED',
        channel: 'WHATSAPP',
        retries: 0,
        messageText:
          'Hello Anil Kumar,\nYour outstanding balance of ₹850 is pending with Kirana General Store. Please make the payment at your convenience. Thank you.\n\nPay via UPI: kiranastore@oksbi',
        createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rem-2',
        storeId: 'store-01',
        customerId: 'cust-5',
        customerName: 'Vikram Kumar',
        phone: '+91 98112 23344',
        amount: 3400,
        shopName: 'Kirana General Store',
        scheduledDate: new Date().toISOString(),
        status: 'SCHEDULED',
        channel: 'WHATSAPP',
        retries: 0,
        messageText:
          'Hello Vikram Kumar,\nYour outstanding balance of ₹3400 is pending with Kirana General Store. Please make the payment at your convenience. Thank you.\n\nPay via UPI: kiranastore@oksbi',
        createdAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rem-3',
        storeId: 'store-01',
        customerId: 'cust-9',
        customerName: 'Rajesh Gupta',
        phone: '+91 99123 55667',
        amount: 2100,
        shopName: 'Kirana General Store',
        scheduledDate: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        status: 'SENT',
        sentAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
        channel: 'WHATSAPP',
        retries: 0,
        messageText:
          'Hello Rajesh Gupta,\nYour outstanding balance of ₹2100 is pending with Kirana General Store. Please make the payment at your convenience. Thank you.\n\nPay via UPI: kiranastore@oksbi',
        createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        id: 'rem-4',
        storeId: 'store-01',
        customerId: 'cust-10',
        customerName: 'Meena Verma',
        phone: '+91 98334 77889',
        amount: 1870,
        shopName: 'Kirana General Store',
        scheduledDate: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
        status: 'FAILED',
        failureReason: 'WhatsApp delivery timeout / Network unreachable',
        retries: 2,
        channel: 'WHATSAPP',
        messageText:
          'Hello Meena Verma,\nYour outstanding balance of ₹1870 is pending with Kirana General Store. Please make the payment at your convenience. Thank you.\n\nPay via UPI: kiranastore@oksbi',
        createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
      },
    ];

    const auditLogs: AuditLog[] = [
      {
        id: 'log-1',
        storeId: 'store-01',
        actor: 'Suresh Patel (Owner)',
        action: 'RECORD_CREDIT',
        entity: 'Transaction',
        entityId: 'tx-1',
        timestamp: new Date(now - 1000 * 60 * 120).toISOString(),
        result: 'SUCCESS',
        details: 'Recorded credit of ₹450 for Ramesh Kumar',
      },
      {
        id: 'log-2',
        storeId: 'store-01',
        actor: 'Suresh Patel (Owner)',
        action: 'RECORD_PAYMENT',
        entity: 'Transaction',
        entityId: 'tx-2',
        timestamp: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
        result: 'SUCCESS',
        details: 'Recorded cash payment of ₹1,200 from Suresh Traders',
      },
      {
        id: 'log-3',
        storeId: 'store-01',
        actor: 'Automated 8-Day Engine',
        action: 'SCHEDULE_REMINDERS',
        entity: 'ReminderJob',
        entityId: 'rem-1',
        timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
        result: 'SUCCESS',
        details: 'Scheduled 8-day reminder for Anil Kumar (₹850)',
      },
    ];

    return {
      store,
      customers,
      transactions,
      reminders,
      auditLogs,
      otpSessions: {},
    };
  }
}

export const db = Database.getInstance();
