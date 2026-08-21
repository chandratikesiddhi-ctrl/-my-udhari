import { db } from '../config/database';
import { StoreProfile } from '../types';
import { IStoreRepository } from './interfaces';
import { hashPin, verifyPin } from '../utils/crypto';

export class StoreRepository implements IStoreRepository {
  async getProfile(): Promise<StoreProfile> {
    const data = db.getData();
    // Return profile without exposing sensitive pinHash directly
    const { pinHash: _pin, ...rest } = data.store;
    return rest as StoreProfile;
  }

  async updateProfile(updates: Partial<StoreProfile>): Promise<StoreProfile> {
    return db.mutate((data) => {
      data.store = {
        ...data.store,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const { pinHash: _pin, ...rest } = data.store;
      return rest as StoreProfile;
    });
  }

  async verifyPin(pin: string): Promise<boolean> {
    const data = db.getData();
    const pinHash = data.store.pinHash || hashPin('1234');
    return verifyPin(pin, pinHash);
  }

  async updatePin(newPin: string): Promise<void> {
    const pinHash = hashPin(newPin);
    await db.mutate((data) => {
      data.store.pinHash = pinHash;
      data.store.updatedAt = new Date().toISOString();
    });
  }
}

export const storeRepository = new StoreRepository();
