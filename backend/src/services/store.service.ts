import { storeRepository } from '../repositories/store.repository';
import { auditRepository } from '../repositories/audit.repository';
import { StoreProfile, JwtPayload } from '../types';
import { BACKUP_OVERDUE_THRESHOLD_DAYS } from '../constants';

export class StoreService {
  async getProfile(): Promise<StoreProfile & { isBackupOverdue: boolean; daysSinceBackup: number | null }> {
    const profile = await storeRepository.getProfile();
    let daysSinceBackup: number | null = null;
    let isBackupOverdue = false;

    if (profile.lastBackupDate) {
      const backupTime = new Date(profile.lastBackupDate).getTime();
      const diffMs = Math.max(0, Date.now() - backupTime);
      daysSinceBackup = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      isBackupOverdue = daysSinceBackup > BACKUP_OVERDUE_THRESHOLD_DAYS;
    } else {
      isBackupOverdue = true;
    }

    return {
      ...profile,
      isBackupOverdue,
      daysSinceBackup,
    };
  }

  async updateProfile(updates: Partial<StoreProfile>, user?: JwtPayload): Promise<StoreProfile> {
    const updated = await storeRepository.updateProfile(updates);

    await auditRepository.create({
      id: `log-${Date.now()}`,
      storeId: updated.id,
      actor: user ? `${user.name} (${user.role})` : 'System/Admin',
      action: 'UPDATE_STORE_SETTINGS',
      entity: 'StoreProfile',
      entityId: updated.id,
      timestamp: new Date().toISOString(),
      result: 'SUCCESS',
      details: `Updated store profile and settings`,
    });

    return updated;
  }
}

export const storeService = new StoreService();
