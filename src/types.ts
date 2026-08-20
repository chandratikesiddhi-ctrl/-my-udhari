export type TransactionType = 'CREDIT' | 'PAYMENT';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number; // positive = customer owes store (You will get), negative = store owes customer (You will give), 0 = settled
  reminderEnabled: boolean;
  reminderIntervalDays: number;
  lastTransactionDate: string;
  lastReminderSentDate?: string;
  createdAt: string;
  notes?: string;
  avatarColor?: string;
}

export interface Transaction {
  id: string;
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
}

export type ReminderStatus = 'SCHEDULED' | 'SENT' | 'DELIVERED' | 'FAILED';

export interface ReminderJob {
  id: string;
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
}

export interface StoreProfile {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  address: string;
  upiId: string;
  reminderIntervalDays: number;
  autoRemindersEnabled: boolean;
  preferredChannel: 'WHATSAPP' | 'SMS';
  userRole: 'Owner' | 'Staff';
  lastBackupDate?: string;
}

export interface AuditLog {
  id: string;
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
}

export type NavTab = 'home' | 'customers' | 'reports' | 'reminders' | 'settings';
