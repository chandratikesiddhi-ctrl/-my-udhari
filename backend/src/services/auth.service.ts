import { storeRepository } from '../repositories/store.repository';
import { customerRepository } from '../repositories/customer.repository';
import { auditRepository } from '../repositories/audit.repository';
import { db } from '../config/database';
import { AppError } from '../utils/errors';
import { signJwt, generateOtp } from '../utils/crypto';
import { extractDigits, normalizePhone } from '../utils/formatters';
import { OTP_EXPIRY_SECONDS, MAX_OTP_ATTEMPTS } from '../constants';
import { UserSession } from '../types';

export class AuthService {
  /**
   * Store Owner / Staff Login via PIN
   */
  async storeLogin(role: 'Owner' | 'Staff', pin: string): Promise<{ token: string; user: UserSession }> {
    const isPinValid = await storeRepository.verifyPin(pin);
    if (!isPinValid) {
      throw AppError.badRequest('Invalid PIN code. Please enter the correct 4-digit PIN.');
    }

    const store = await storeRepository.getProfile();
    const userName = role === 'Owner' ? store.ownerName || 'Rajesh Sharma' : 'Staff Member';
    const userPhone = store.phone || '+91 98230 12345';
    const userId = role === 'Owner' ? 'user-owner-1' : 'user-staff-1';

    const token = signJwt({
      id: userId,
      name: userName,
      phone: userPhone,
      role,
      storeId: store.id,
    });

    const user: UserSession = {
      id: userId,
      name: userName,
      phone: userPhone,
      role,
      isLoggedIn: true,
      storeId: store.id,
    };

    await auditRepository.create({
      id: `log-${Date.now()}`,
      storeId: store.id,
      actor: `${userName} (${role})`,
      action: 'STORE_LOGIN',
      entity: 'StoreProfile',
      entityId: store.id,
      timestamp: new Date().toISOString(),
      result: 'SUCCESS',
      details: `User logged in as ${userName} (${role})`,
    });

    return { token, user };
  }

  /**
   * Send OTP to Customer mobile number
   */
  async customerSendOtp(phone: string): Promise<{ phone: string; otpExpiresInSeconds: number; demoOtp: string }> {
    const digits = extractDigits(phone);
    const customer = await customerRepository.findByPhone(digits);

    if (!customer) {
      throw AppError.notFound('Customer not found in store ledger. Please ask the shopkeeper to register your mobile number.');
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + OTP_EXPIRY_SECONDS * 1000;

    await db.mutate((data) => {
      data.otpSessions[digits] = {
        otp,
        expiresAt,
        customerId: customer.id,
        attempts: 0,
      };
    });

    return {
      phone: normalizePhone(customer.phone),
      otpExpiresInSeconds: OTP_EXPIRY_SECONDS,
      demoOtp: otp, // In local/demo mode for easy testing
    };
  }

  /**
   * Verify Customer OTP and Issue Customer-Scoped Token
   */
  async customerVerifyOtp(phone: string, enteredOtp: string): Promise<{ token: string; session: UserSession; customer: any }> {
    const digits = extractDigits(phone);
    const data = db.getData();
    const session = data.otpSessions[digits];

    if (!session) {
      throw AppError.badRequest('No active OTP session found. Please request a new OTP.');
    }

    if (Date.now() > session.expiresAt) {
      await db.mutate((d) => {
        delete d.otpSessions[digits];
      });
      throw AppError.badRequest('OTP has expired. Please request a new OTP.');
    }

    if (session.attempts >= MAX_OTP_ATTEMPTS) {
      await db.mutate((d) => {
        delete d.otpSessions[digits];
      });
      throw AppError.badRequest('Too many incorrect attempts. Please request a new OTP.');
    }

    if (session.otp !== enteredOtp.trim()) {
      await db.mutate((d) => {
        if (d.otpSessions[digits]) {
          d.otpSessions[digits].attempts += 1;
        }
      });
      throw AppError.badRequest('Invalid OTP code. Please enter the 4-digit OTP sent to your phone.');
    }

    const customer = await customerRepository.findById(session.customerId);
    if (!customer) {
      throw AppError.notFound('Customer account record not found.');
    }

    // Clean up OTP session
    await db.mutate((d) => {
      delete d.otpSessions[digits];
    });

    const store = await storeRepository.getProfile();
    const token = signJwt({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      role: 'Customer',
      storeId: store.id,
      customerId: customer.id,
    });

    const userSession: UserSession = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      role: 'Customer',
      isLoggedIn: true,
      customerId: customer.id,
      storeId: store.id,
    };

    await auditRepository.create({
      id: `log-${Date.now()}`,
      storeId: store.id,
      actor: `${customer.name} (Customer)`,
      action: 'CUSTOMER_LOGIN',
      entity: 'Customer',
      entityId: customer.id,
      timestamp: new Date().toISOString(),
      result: 'SUCCESS',
      details: `Customer ${customer.name} logged in to view passbook`,
    });

    return { token, session: userSession, customer };
  }
}

export const authService = new AuthService();
