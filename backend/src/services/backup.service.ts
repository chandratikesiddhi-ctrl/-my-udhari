import { db } from '../config/database';
import { auditRepository } from '../repositories/audit.repository';
import { storeRepository } from '../repositories/store.repository';
import { JwtPayload } from '../types';

export class BackupService {
  /**
   * Export full database JSON snapshot & update lastBackupDate
   */
  async exportBackup(user?: JwtPayload) {
    const nowIso = new Date().toISOString();

    // Update store lastBackupDate
    await storeRepository.updateProfile({ lastBackupDate: nowIso });

    const data = db.getData();
    const { pinHash: _pin, ...storeSafe } = data.store;

    const backupSnapshot = {
      store: storeSafe,
      customers: data.customers,
      transactions: data.transactions,
      reminders: data.reminders,
      auditLogs: data.auditLogs,
      exportedAt: nowIso,
      version: '1.0.0',
    };

    await auditRepository.create({
      id: `log-${Date.now()}`,
      storeId: storeSafe.id,
      actor: user ? `${user.name} (${user.role})` : 'Store Owner',
      action: 'EXPORT_BACKUP',
      entity: 'System',
      entityId: 'backup',
      timestamp: nowIso,
      result: 'SUCCESS',
      details: `Exported full database JSON snapshot (${data.customers.length} customers, ${data.transactions.length} transactions)`,
    });

    return backupSnapshot;
  }

  /**
   * Reset data to default seed
   */
  async resetDemoData(user?: JwtPayload): Promise<void> {
    await db.resetDemoData();

    await auditRepository.create({
      id: `log-${Date.now()}`,
      storeId: 'store-01',
      actor: user ? `${user.name} (${user.role})` : 'Store Owner',
      action: 'RESET_DEMO_DATA',
      entity: 'System',
      entityId: 'database',
      timestamp: new Date().toISOString(),
      result: 'SUCCESS',
      details: `Restored entire database back to default initial seed dataset`,
    });
  }
}

export const backupService = new BackupService();
