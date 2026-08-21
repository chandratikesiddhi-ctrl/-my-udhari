import { db } from '../config/database';
import { ReminderJob } from '../types';
import { IReminderRepository } from './interfaces';

export class ReminderRepository implements IReminderRepository {
  async findAll(status?: string): Promise<ReminderJob[]> {
    const data = db.getData();
    let list = [...data.reminders];

    if (status && status !== 'ALL') {
      list = list.filter((r) => r.status === status);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findById(id: string): Promise<ReminderJob | null> {
    const data = db.getData();
    return data.reminders.find((r) => r.id === id) || null;
  }

  async create(job: ReminderJob): Promise<ReminderJob> {
    return db.mutate((data) => {
      data.reminders.unshift(job);
      return job;
    });
  }

  async update(id: string, updates: Partial<ReminderJob>): Promise<ReminderJob | null> {
    return db.mutate((data) => {
      const index = data.reminders.findIndex((r) => r.id === id);
      if (index === -1) return null;

      data.reminders[index] = {
        ...data.reminders[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return data.reminders[index];
    });
  }

  async deleteByCustomerId(customerId: string): Promise<number> {
    return db.mutate((data) => {
      const initialCount = data.reminders.length;
      data.reminders = data.reminders.filter((r) => r.customerId !== customerId);
      return initialCount - data.reminders.length;
    });
  }

  async cancelScheduledForCustomer(customerId: string): Promise<number> {
    return db.mutate((data) => {
      const initialCount = data.reminders.length;
      data.reminders = data.reminders.filter(
        (r) => !(r.customerId === customerId && r.status === 'SCHEDULED')
      );
      return initialCount - data.reminders.length;
    });
  }
}

export const reminderRepository = new ReminderRepository();
