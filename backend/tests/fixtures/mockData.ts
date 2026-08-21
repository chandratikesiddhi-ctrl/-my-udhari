export const testStoreData = {
  id: 'store-test-01',
  name: 'Test Kirana Store',
  ownerName: 'Test Owner',
  phone: '+91 99999 00001',
  address: 'Test Address',
  upiId: 'test@upi',
  reminderIntervalDays: 8,
  autoRemindersEnabled: true,
  preferredChannel: 'WHATSAPP' as const,
  userRole: 'Owner' as const,
};

export const testCustomerData = {
  name: 'Test Customer 1',
  phone: '+91 98888 11111',
  initialBalance: 500,
  reminderEnabled: true,
  notes: 'Test notes',
};
