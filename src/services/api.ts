/**
 * My Udhari Frontend API Service Client
 * Connects to the backend REST API (/api/v1) with seamless bearer token handling
 */

import {
  Customer,
  Transaction,
  StoreProfile,
  ReminderJob,
  AuditLog,
  UserSession,
  TransactionType,
} from '../types';

const API_BASE_URL = '/api/v1';
const TOKEN_STORAGE_KEY = 'my_udhari_auth_token_v1';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function removeAuthToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; code?: string }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: error?.message || 'Failed to connect to backend server',
    };
  }
}

export const api = {
  // Health
  checkHealth: () => fetchApi('/health'),

  // Auth
  storeLogin: async (role: 'Owner' | 'Staff', pin: string) => {
    const res = await fetchApi<{ token: string; user: UserSession }>('/auth/store/login', {
      method: 'POST',
      body: JSON.stringify({ role, pin }),
    });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },

  customerSendOtp: (phone: string) =>
    fetchApi<{ phone: string; otpExpiresInSeconds: number; demoOtp: string }>(
      '/auth/customer/send-otp',
      {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }
    ),

  customerVerifyOtp: async (phone: string, otp: string) => {
    const res = await fetchApi<{ token: string; session: UserSession; customer: Customer }>(
      '/auth/customer/verify-otp',
      {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      }
    ),
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },

  logout: () => {
    removeAuthToken();
  },

  // Store Profile & Settings
  getStoreProfile: () => fetchApi<StoreProfile & { isBackupOverdue: boolean; daysSinceBackup: number | null }>('/store/profile'),
  updateStoreProfile: (profile: Partial<StoreProfile>) =>
    fetchApi<StoreProfile>('/store/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    }),

  // Customers
  listCustomers: (params?: { search?: string; status?: string; sort?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi<{ customers: Customer[]; totalOutstanding: number; activeDebtorsCount: number; settledCount: number }>(
      `/customers${query ? `?${query}` : ''}`
    );
  },

  getCustomerById: (id: string) =>
    fetchApi<{ customer: Customer; transactions: Transaction[] }>(`/customers/${id}`),

  createCustomer: (data: {
    name: string;
    phone: string;
    initialBalance?: number;
    reminderEnabled?: boolean;
    notes?: string;
  }) =>
    fetchApi<{ customer: Customer; initialTransaction?: Transaction }>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCustomerReminderPreference: (id: string, data: { reminderEnabled: boolean; reminderIntervalDays?: number }) =>
    fetchApi<Customer>(`/customers/${id}/reminder-preference`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCustomer: (id: string) =>
    fetchApi(`/customers/${id}`, {
      method: 'DELETE',
    }),

  // Transactions
  recordTransaction: (data: {
    customerId: string;
    type: TransactionType;
    amount: number;
    note?: string;
  }) =>
    fetchApi<{ transaction: Transaction; customer: Customer }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listTransactions: (params?: { customerId?: string; type?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchApi<Transaction[]>(`/transactions${query ? `?${query}` : ''}`);
  },

  // Reminders
  listReminders: (status?: string) =>
    fetchApi<{ jobs: ReminderJob[]; scheduledCount: number; sentCount: number; failedCount: number }>(
      `/reminders${status ? `?status=${status}` : ''}`
    ),

  scanReminders: () =>
    fetchApi<{ newlyScheduled: ReminderJob[]; count: number }>('/reminders/scan', {
      method: 'POST',
    }),

  processBatchReminders: () =>
    fetchApi<{ processedCount: number; jobs: ReminderJob[] }>('/reminders/batch-send', {
      method: 'POST',
    }),

  sendSingleReminder: (jobId: string) =>
    fetchApi<ReminderJob>(`/reminders/${jobId}/send`, {
      method: 'POST',
    }),

  retryReminder: (jobId: string) =>
    fetchApi<ReminderJob>(`/reminders/${jobId}/retry`, {
      method: 'POST',
    }),

  // Reports
  getReportsSummary: () => fetchApi('/reports/summary'),
  getExportCsvUrl: () => `${API_BASE_URL}/reports/export-csv`,

  // Audit
  listAuditLogs: (limit = 100) => fetchApi<AuditLog[]>(`/audit/logs?limit=${limit}`),

  // Backup & Reset
  exportBackup: () => fetchApi('/backup/export'),
  resetDemoData: () =>
    fetchApi('/backup/reset-demo', {
      method: 'POST',
    }),

  // AI Gemini
  generateAiReminder: (data: {
    customerName: string;
    amount: number;
    daysOverdue?: number;
    language?: 'en' | 'mr';
    tone?: 'polite' | 'firm' | 'festive';
  }) =>
    fetchApi<{ message: string; source: 'gemini' | 'template' }>('/ai/generate-reminder', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAiInsights: () => fetchApi('/ai/insights'),
};
