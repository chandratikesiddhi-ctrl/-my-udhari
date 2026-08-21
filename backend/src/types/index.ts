export type TransactionType = 'CREDIT' | 'PAYMENT';

export interface Customer {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  balance: number; // positive = customer owes store (You will get), negative = advance given, 0 = settled
  reminderEnabled: boolean;
  reminderIntervalDays: number;
  lastTransactionDate: string; // ISO string
  lastReminderSentDate?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  avatarColor?: string;
  isDeleted?: boolean;
}

export interface Transaction {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  type: TransactionType;
  amount: number;
  note?: string;
  timestamp: string; // ISO string
  formattedDate: string;
  formattedTime: string;
  createdBy: 'Owner' | 'Staff';
  balanceAfter: number;
  createdAt: string;
}

export type ReminderStatus = 'SCHEDULED' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface ReminderJob {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  phone: string;
  amount: number;
  shopName: string;
  scheduledDate: string;
  status: ReminderStatus;
  channel: 'WHATSAPP' | 'SMS';
  sentAt?: string;
  failureReason?: string;
  retries: number;
  messageText: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreProfile {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  upiId: string;
  pinHash?: string;
  reminderIntervalDays: number;
  autoRemindersEnabled: boolean;
  preferredChannel: 'WHATSAPP' | 'SMS';
  userRole: 'Owner' | 'Staff';
  lastBackupDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  storeId: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  result: 'SUCCESS' | 'FAILED';
  reason?: string;
  details?: string;
}

export interface UserSession {
  id: string;
  name: string;
  phone: string;
  role: 'Owner' | 'Staff' | 'Customer';
  isLoggedIn: boolean;
  pin?: string;
  customerId?: string;
  storeId?: string;
}

export interface JwtPayload {
  id: string;
  name: string;
  phone: string;
  role: 'Owner' | 'Staff' | 'Customer';
  storeId: string;
  customerId?: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  errors?: Array<{ field?: string; message: string }>;
}

export interface DatabaseSchema {
  store: StoreProfile;
  customers: Customer[];
  transactions: Transaction[];
  reminders: ReminderJob[];
  auditLogs: AuditLog[];
  otpSessions: Record<string, { otp: string; expiresAt: number; customerId: string; attempts: number }>;
}
