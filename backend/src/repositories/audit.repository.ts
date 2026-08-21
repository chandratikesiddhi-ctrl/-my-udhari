import { db } from '../config/database';
import { AuditLog } from '../types';
import { IAuditRepository } from './interfaces';

export class AuditRepository implements IAuditRepository {
  async findAll(limit = 200): Promise<AuditLog[]> {
    const data = db.getData();
    return [...data.auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async create(log: AuditLog): Promise<AuditLog> {
    return db.mutate((data) => {
      data.auditLogs.unshift(log);
      // Keep up to 1000 logs to prevent unbounded file size
      if (data.auditLogs.length > 1000) {
        data.auditLogs = data.auditLogs.slice(0, 1000);
      }
      return log;
    });
  }
}

export const auditRepository = new AuditRepository();
