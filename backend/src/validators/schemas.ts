import { Request } from 'express';
import { extractDigits } from '../utils/formatters';

export function validateStoreLogin(req: Request) {
  const errors: Array<{ field?: string; message: string }> = [];
  const { role, pin } = req.body || {};

  if (!role || !['Owner', 'Staff'].includes(role)) {
    errors.push({ field: 'role', message: 'Role must be either "Owner" or "Staff"' });
  }

  if (!pin || typeof pin !== 'string' || pin.trim().length < 4) {
    errors.push({ field: 'pin', message: 'PIN must be at least 4 digits' });
  }

  return errors.length > 0 ? errors : null;
}

export function validateCustomerSendOtp(req: Request) {
  const errors: Array<{ field?: string; message: string }> = [];
  const { phone } = req.body || {};

  if (!phone || typeof phone !== 'string' || extractDigits(phone).length < 10) {
    errors.push({ field: 'phone', message: 'A valid 10-digit mobile number is required' });
  }

  return errors.length > 0 ? errors : null;
}

export function validateCustomerVerifyOtp(req: Request) {
  const errors: Array<{ field?: string; message: string }> = [];
  const { phone, otp } = req.body || {};

  if (!phone || typeof phone !== 'string' || extractDigits(phone).length < 10) {
    errors.push({ field: 'phone', message: 'A valid 10-digit mobile number is required' });
  }

  if (!otp || typeof otp !== 'string' || otp.trim().length !== 4) {
    errors.push({ field: 'otp', message: 'OTP must be exactly 4 digits' });
  }

  return errors.length > 0 ? errors : null;
}

export function validateUpdateStore(req: Request) {
  const errors: Array<{ field?: string; message: string }> = [];
  const { name, ownerName, phone, reminderIntervalDays, preferredChannel } = req.body || {};

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    errors.push({ field: 'name', message: 'Store name must be at least 2 characters' });
  }

  if (ownerName !== undefined && (typeof ownerName !== 'string' || ownerName.trim().length < 2)) {
    errors.push({ field: 'ownerName', message: 'Owner name must be at least 2 characters' });
  }

  if (phone !== undefined && (typeof phone !== 'string' || extractDigits(phone).length < 10)) {
    errors.push({ field: 'phone', message: 'Phone must be a valid 10-digit number' });
  }

  if (reminderIntervalDays !== undefined) {
    const days = Number(reminderIntervalDays);
    if (isNaN(days) || days < 1 || days > 90) {
      errors.push({ field: 'reminderIntervalDays', message: 'Reminder interval must be between 1 and 90 days' });
    }
  }

  if (preferredChannel !== undefined && !['WHATSAPP', 'SMS'].includes(preferredChannel)) {
    errors.push({ field: 'preferredChannel', message: 'Preferred channel must be "WHATSAPP" or "SMS"' });
  }

  return errors.length > 0 ? errors : null;
}

export function validateCreateCustomer(req: Request) {
  const errors: Array<{ field?: string; message: string }> = [];
  const { name, phone, initialBalance, reminderIntervalDays } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Customer name must be at least 2 characters' });
  }

  if (!phone || typeof phone !== 'string' || extractDigits(phone).length < 10) {
    errors.push({ field: 'phone', message: 'A valid 10-digit mobile number is required' });
  }

  if (initialBalance !== undefined && typeof initialBalance !== 'number' && isNaN(Number(initialBalance))) {
    errors.push({ field: 'initialBalance', message: 'Initial balance must be a valid number' });
  }

  if (reminderIntervalDays !== undefined) {
    const days = Number(reminderIntervalDays);
    if (isNaN(days) || days < 1 || days > 90) {
      errors.push({ field: 'reminderIntervalDays', message: 'Reminder interval must be between 1 and 90 days' });
    }
  }

  return errors.length > 0 ? errors : null;
}

export function validateUpdateCustomerReminder(req: Request) {
  const errors: Array<{ field?: string; message: string }> = [];
  const { reminderEnabled, reminderIntervalDays } = req.body || {};

  if (reminderEnabled !== undefined && typeof reminderEnabled !== 'boolean') {
    errors.push({ field: 'reminderEnabled', message: 'reminderEnabled must be a boolean' });
  }

  if (reminderIntervalDays !== undefined) {
    const days = Number(reminderIntervalDays);
    if (isNaN(days) || days < 1 || days > 90) {
      errors.push({ field: 'reminderIntervalDays', message: 'Reminder interval must be between 1 and 90 days' });
    }
  }

  return errors.length > 0 ? errors : null;
}

export function validateRecordTransaction(req: Request) {
  const errors: Array<{ field?: string; message: string }> = [];
  const { customerId, type, amount, note } = req.body || {};

  if (!customerId || typeof customerId !== 'string') {
    errors.push({ field: 'customerId', message: 'customerId is required' });
  }

  if (!type || !['CREDIT', 'PAYMENT'].includes(type)) {
    errors.push({ field: 'type', message: 'Transaction type must be "CREDIT" or "PAYMENT"' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number greater than 0' });
  }

  if (note !== undefined && typeof note !== 'string') {
    errors.push({ field: 'note', message: 'Note must be a string' });
  }

  return errors.length > 0 ? errors : null;
}

export function validateGenerateAiReminder(req: Request) {
  const errors: Array<{ field?: string; message: string }> = [];
  const { customerName, amount } = req.body || {};

  if (!customerName || typeof customerName !== 'string') {
    errors.push({ field: 'customerName', message: 'customerName is required' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
  }

  return errors.length > 0 ? errors : null;
}
