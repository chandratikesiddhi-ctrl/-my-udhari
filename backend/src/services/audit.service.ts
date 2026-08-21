import { auditRepository } from '../repositories/audit.repository';
import { AuditLog } from '../types';

export class AuditService {
  async listLogs(limit = 100): Promise<AuditLog[]> {
    return auditRepository.findAll(limit);
  }

  async logEvent(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    return auditRepository.create({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }
}

export const auditService = new AuditService();
