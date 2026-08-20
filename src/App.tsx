import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { CustomerListScreen } from './components/CustomerListScreen';
import { CustomerDetailScreen } from './components/CustomerDetailScreen';
import { TransactionModal } from './components/TransactionModal';
import { AddCustomerModal } from './components/AddCustomerModal';
import { RemindersScreen } from './components/RemindersScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ReminderMessageModal } from './components/ReminderMessageModal';
import { CustomerLoginScreen } from './components/CustomerLoginScreen';
import { CustomerDashboard } from './components/CustomerDashboard';
import { StoreLoginModal } from './components/StoreLoginModal';
import { 
  Customer, 
  Transaction, 
  StoreProfile, 
  ReminderJob, 
  AuditLog, 
  NavTab, 
  TransactionType,
  UserSession 
} from './types';
import { 
  initialStoreProfile, 
  initialCustomers, 
  initialTransactions, 
  initialReminders, 
  initialAuditLogs 
} from './data/mockData';
import { generateReminderMessage } from './utils/formatters';

const STORAGE_KEYS = {
  STORE: 'my_udhari_store_v1',
  CUSTOMERS: 'my_udhari_customers_v1',
  TRANSACTIONS: 'my_udhari_transactions_v1',
  REMINDERS: 'my_udhari_reminders_v1',
  AUDIT: 'my_udhari_audit_v1',
  USER: 'my_udhari_user_v1',
  APP_MODE: 'my_udhari_mode_v1',
};

type AppMode = 'CUSTOMER_LOGIN' | 'CUSTOMER_PASSBOOK' | 'STORE_LEDGER';

export default function App() {
  // Load state from localStorage or mock defaults
  const [store, setStore] = useState<StoreProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORE);
    return saved ? JSON.parse(saved) : initialStoreProfile;
  });

  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved
      ? JSON.parse(saved)
      : {
          id: 'user-owner-1',
          name: initialStoreProfile.ownerName || 'Rajesh Sharma',
          phone: initialStoreProfile.phone || '+91 98230 12345',
          role: 'Owner',
          isLoggedIn: true,
        };
  });

  const [appMode, setAppMode] = useState<AppMode>(() => {
    const savedMode = localStorage.getItem(STORAGE_KEYS.APP_MODE) as AppMode | null;
    if (savedMode) return savedMode;
    return 'STORE_LEDGER';
  });

  const [isStoreLoginModalOpen, setIsStoreLoginModalOpen] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [reminders, setReminders] = useState<ReminderJob[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return saved ? JSON.parse(saved) : initialReminders;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  // Navigation and active view state
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Modals state
  const [txModalState, setTxModalState] = useState<{
    isOpen: boolean;
    type: TransactionType;
    customerId?: string;
  }>({
    isOpen: false,
    type: 'CREDIT',
  });

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [reminderModalCustomer, setReminderModalCustomer] = useState<Customer | null>(null);

  // Toast notification state
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APP_MODE, appMode);
  }, [appMode]);

  // Total Outstanding Calculation
  const totalOutstanding = customers.reduce(
    (sum, c) => (c.balance > 0 ? sum + c.balance : sum),
    0
  );

  // Scheduled reminders count
  const pendingRemindersCount = reminders.filter((r) => r.status === 'SCHEDULED').length;

  // Selected customer object
  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || null;

  // Logged-in customer object if in customer passbook mode
  const loggedInCustomer =
    currentUser.role === 'Customer' && currentUser.customerId
      ? customers.find((c) => c.id === currentUser.customerId) || null
      : null;

  // Log an audit event (PRD 14.7 & 18)
  const addAuditLog = (action: string, entity: string, entityId: string, details: string, result: 'SUCCESS' | 'FAILED' = 'SUCCESS') => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actor: `${currentUser.name} (${currentUser.role})`,
      action,
      entity,
      entityId,
      timestamp: new Date().toISOString(),
      result,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Customer Login Handler
  const handleCustomerLogin = (session: UserSession, customer: Customer) => {
    setCurrentUser(session);
    setAppMode('CUSTOMER_PASSBOOK');
    addAuditLog('CUSTOMER_LOGIN', 'Customer', customer.id, `Customer ${customer.name} logged in to view passbook`);
    showToast(`Welcome ${customer.name}!`);
  };

  // Customer Logout Handler
  const handleCustomerLogout = () => {
    const guestUser: UserSession = {
      id: 'guest',
      name: 'Customer',
      phone: '',
      role: 'Customer',
      isLoggedIn: false,
    };
    setCurrentUser(guestUser);
    setAppMode('CUSTOMER_LOGIN');
    showToast('Logged out of Customer Passbook', 'info');
  };

  // Store Owner / Staff Login Handler
  const handleStoreLogin = (session: UserSession) => {
    setCurrentUser(session);
    setStore((prev) => ({ ...prev, userRole: session.role === 'Owner' ? 'Owner' : 'Staff' }));
    setAppMode('STORE_LEDGER');
    addAuditLog('STORE_LOGIN', 'StoreProfile', store.id, `User logged in as ${session.name} (${session.role})`);
    showToast(`Signed in as ${session.name}!`);
  };

  // Record Transaction Handler (Credit or Payment)
  const handleRecordTransaction = (data: {
    customerId: string;
    type: TransactionType;
    amount: number;
    note: string;
  }) => {
    const targetCustomer = customers.find((c) => c.id === data.customerId);
    if (!targetCustomer) return;

    const isCredit = data.type === 'CREDIT';
    // Calculate new balance
    const newBalance = isCredit
      ? targetCustomer.balance + data.amount
      : targetCustomer.balance - data.amount;

    const now = new Date();
    const formattedDate = 'Today';
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      type: data.type,
      amount: data.amount,
      note: data.note,
      timestamp: now.toISOString(),
      formattedDate,
      formattedTime,
      createdBy: store.userRole,
      balanceAfter: newBalance,
    };

    // Update transactions
    setTransactions((prev) => [newTx, ...prev]);

    // Update customer balance and lastTransactionDate
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === targetCustomer.id
          ? {
              ...c,
              balance: newBalance,
              lastTransactionDate: now.toISOString(),
            }
          : c
      )
    );

    // PRD Section 11.5: If balance becomes <= 0 (payment cleared), auto cancel/remove pending scheduled reminder jobs
    if (newBalance <= 0) {
      setReminders((prev) =>
        prev.filter((r) => !(r.customerId === targetCustomer.id && r.status === 'SCHEDULED'))
      );
    }

    addAuditLog(
      isCredit ? 'RECORD_CREDIT' : 'RECORD_PAYMENT',
      'Transaction',
      newTx.id,
      `${isCredit ? 'Gave credit' : 'Received payment'} of ₹${data.amount} for ${targetCustomer.name} (Balance: ₹${newBalance})`
    );

    setTxModalState({ isOpen: false, type: 'CREDIT' });
    showToast(
      isCredit
        ? `₹${data.amount} credit added for ${targetCustomer.name}`
        : `₹${data.amount} payment recorded from ${targetCustomer.name}!`,
      'success'
    );
  };

  // Add Customer Handler
  const handleAddCustomer = (data: {
    name: string;
    phone: string;
    initialBalance: number;
    reminderEnabled: boolean;
    notes?: string;
  }) => {
    const newCustId = `cust-${Date.now()}`;
    const now = new Date().toISOString();

    const newCustomer: Customer = {
      id: newCustId,
      name: data.name,
      phone: data.phone,
      balance: data.initialBalance,
      reminderEnabled: data.reminderEnabled,
      reminderIntervalDays: store.reminderIntervalDays || 8,
      lastTransactionDate: now,
      createdAt: now,
      notes: data.notes,
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    // If initial balance was provided, create opening transaction
    if (data.initialBalance !== 0) {
      const isCredit = data.initialBalance > 0;
      const initialTx: Transaction = {
        id: `tx-init-${Date.now()}`,
        customerId: newCustId,
        customerName: data.name,
        type: isCredit ? 'CREDIT' : 'PAYMENT',
        amount: Math.abs(data.initialBalance),
        note: 'Opening balance',
        timestamp: now,
        formattedDate: 'Today',
        formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdBy: store.userRole,
        balanceAfter: data.initialBalance,
      };
      setTransactions((prev) => [initialTx, ...prev]);
    }

    addAuditLog('CREATE_CUSTOMER', 'Customer', newCustId, `Created customer ${data.name} (${data.phone})`);
    showToast(`Customer ${data.name} added successfully!`);
    setSelectedCustomerId(newCustId);
  };

  // Toggle Customer Reminders
  const handleToggleCustomerReminder = (enabled: boolean) => {
    if (!selectedCustomerId) return;
    setCustomers((prev) =>
      prev.map((c) => (c.id === selectedCustomerId ? { ...c, reminderEnabled: enabled } : c))
    );
    addAuditLog('UPDATE_REMINDER_PREFERENCE', 'Customer', selectedCustomerId, `Set reminder enabled: ${enabled}`);
    showToast(`Reminders ${enabled ? 'activated' : 'disabled'} for ${activeCustomer?.name}`);
  };

  // Delete / Archive Customer
  const handleDeleteCustomer = (customerId: string) => {
    const c = customers.find((cust) => cust.id === customerId);
    setCustomers((prev) => prev.filter((cust) => cust.id !== customerId));
    setTransactions((prev) => prev.filter((tx) => tx.customerId !== customerId));
    setReminders((prev) => prev.filter((r) => r.customerId !== customerId));
    setSelectedCustomerId(null);
    if (c) {
      addAuditLog('DELETE_CUSTOMER', 'Customer', customerId, `Deleted customer ${c.name}`);
      showToast(`Customer ${c.name} deleted.`);
    }
  };

  // Batch process 8-day reminders (PRD Section 9.8 & 11.4)
  const handleTriggerBatchReminders = () => {
    const scheduled = reminders.filter((r) => r.status === 'SCHEDULED');
    if (scheduled.length === 0) {
      showToast('No scheduled reminders to process.', 'info');
      return;
    }

    setReminders((prev) =>
      prev.map((r) =>
        r.status === 'SCHEDULED'
          ? { ...r, status: 'SENT', sentAt: new Date().toISOString() }
          : r
      )
    );

    addAuditLog(
      'PROCESS_BATCH_REMINDERS',
      'ReminderJob',
      'batch',
      `Processed ${scheduled.length} automated 8-day reminders`
    );
    showToast(`Sent ${scheduled.length} automated reminders!`);
  };

  // Send single reminder
  const handleSendSingleReminder = (jobId: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === jobId
          ? { ...r, status: 'SENT', sentAt: new Date().toISOString() }
          : r
      )
    );
    const job = reminders.find((r) => r.id === jobId);
    if (job) {
      addAuditLog('SEND_REMINDER', 'ReminderJob', jobId, `Sent reminder to ${job.customerName}`);
      showToast(`Reminder sent to ${job.customerName}`);
    }
  };

  // Retry failed reminder
  const handleRetryReminder = (jobId: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === jobId
          ? { ...r, status: 'SENT', sentAt: new Date().toISOString(), failureReason: undefined }
          : r
      )
    );
    showToast('Reminder retried and marked sent!');
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    setStore(initialStoreProfile);
    setCustomers(initialCustomers);
    setTransactions(initialTransactions);
    setReminders(initialReminders);
    setAuditLogs(initialAuditLogs);
    setSelectedCustomerId(null);
    setActiveTab('home');
    localStorage.clear();
    showToast('Demo data restored to default state.');
  };

  // Export Backup JSON
  const handleExportBackupJSON = () => {
    const nowIso = new Date().toISOString();
    const updatedStore = { ...store, lastBackupDate: nowIso };
    setStore(updatedStore);

    const backup = {
      store: updatedStore,
      customers,
      transactions,
      reminders,
      auditLogs,
      exportedAt: nowIso,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `My_Udhari_Backup_${nowIso.slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();

    addAuditLog('EXPORT_BACKUP', 'System', 'backup', `Exported full JSON ledger backup (${customers.length} customers, ${transactions.length} transactions)`);
    showToast('Ledger backup JSON exported!');
  };

  // VIEW ROUTER
  // 1. Customer Passbook Dashboard View (When authenticated as customer)
  if (appMode === 'CUSTOMER_PASSBOOK' && loggedInCustomer) {
    return (
      <CustomerDashboard
        customer={loggedInCustomer}
        store={store}
        transactions={transactions}
        onLogout={handleCustomerLogout}
      />
    );
  }

  // 2. Customer Login Screen (Clean separate customer login page)
  if (appMode === 'CUSTOMER_LOGIN') {
    return (
      <>
        <CustomerLoginScreen
          store={store}
          customers={customers}
          onCustomerLogin={handleCustomerLogin}
          onOpenStoreLogin={() => setIsStoreLoginModalOpen(true)}
        />
        <StoreLoginModal
          isOpen={isStoreLoginModalOpen}
          store={store}
          onClose={() => setIsStoreLoginModalOpen(false)}
          onStoreLogin={handleStoreLogin}
        />
      </>
    );
  }

  // 3. Store Owner / Staff Ledger Management View
  return (
    <div className="bg-[#f7f9fc] text-[#191c1e] min-h-screen flex flex-col antialiased selection:bg-[#1a237e] selection:text-white md:max-w-md md:mx-auto md:border-x md:border-[#c6c5d4]/40 md:shadow-2xl">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#000666] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 max-w-[90vw]">
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Main View Router */}
      {selectedCustomerId && activeCustomer ? (
        <CustomerDetailScreen
          customer={activeCustomer}
          transactions={transactions}
          store={store}
          onBack={() => setSelectedCustomerId(null)}
          onGiveCredit={() => setTxModalState({ isOpen: true, type: 'CREDIT', customerId: activeCustomer.id })}
          onRecordPayment={() => setTxModalState({ isOpen: true, type: 'PAYMENT', customerId: activeCustomer.id })}
          onToggleReminder={handleToggleCustomerReminder}
          onOpenReminderModal={() => setReminderModalCustomer(activeCustomer)}
          onDeleteCustomer={handleDeleteCustomer}
        />
      ) : (
        <>
          {/* Header */}
          <Header
            store={store}
            currentUser={currentUser}
            pendingRemindersCount={pendingRemindersCount}
            onOpenReminders={() => setActiveTab('reminders')}
            onOpenStoreSettings={() => setActiveTab('settings')}
            onOpenLogin={() => setAppMode('CUSTOMER_LOGIN')}
          />

          {/* Active Tab Screen */}
          {activeTab === 'home' && (
            <HomeDashboard
              store={store}
              customers={customers}
              transactions={transactions}
              totalOutstanding={totalOutstanding}
              onOpenGiveCredit={() => setTxModalState({ isOpen: true, type: 'CREDIT' })}
              onOpenGotPayment={() => setTxModalState({ isOpen: true, type: 'PAYMENT' })}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
              onViewAllCustomers={() => setActiveTab('customers')}
              onViewReminders={() => setActiveTab('reminders')}
              eligibleRemindersCount={pendingRemindersCount}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerListScreen
              customers={customers}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
              onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
            />
          )}

          {activeTab === 'reminders' && (
            <RemindersScreen
              store={store}
              customers={customers}
              reminderJobs={reminders}
              onTriggerBatchReminders={handleTriggerBatchReminders}
              onSendSingleReminder={handleSendSingleReminder}
              onRetryReminder={handleRetryReminder}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsScreen
              store={store}
              customers={customers}
              transactions={transactions}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              store={store}
              currentUser={currentUser}
              auditLogs={auditLogs}
              onUpdateStore={(updated) => setStore((prev) => ({ ...prev, ...updated }))}
              onResetDemoData={handleResetDemoData}
              onExportBackupJSON={handleExportBackupJSON}
              onOpenLogin={() => setAppMode('CUSTOMER_LOGIN')}
            />
          )}

          {/* Bottom Navigation */}
          <BottomNav
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setSelectedCustomerId(null);
              setActiveTab(tab);
            }}
            pendingRemindersCount={pendingRemindersCount}
          />
        </>
      )}

      {/* Transaction Modal (Give Credit / Got Payment) */}
      <TransactionModal
        isOpen={txModalState.isOpen}
        type={txModalState.type}
        selectedCustomer={
          txModalState.customerId
            ? customers.find((c) => c.id === txModalState.customerId) || null
            : null
        }
        allCustomers={customers}
        onClose={() => setTxModalState({ isOpen: false, type: 'CREDIT' })}
        onSubmit={handleRecordTransaction}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onAddCustomer={handleAddCustomer}
        existingCustomers={customers}
      />

      {/* Reminder Message Preview & WhatsApp Send Modal */}
      <ReminderMessageModal
        isOpen={!!reminderModalCustomer}
        customer={reminderModalCustomer}
        store={store}
        onClose={() => setReminderModalCustomer(null)}
        onSent={(customerId, channel) => {
          setReminders((prev) =>
            prev.map((r) =>
              r.customerId === customerId
                ? { ...r, status: 'SENT', sentAt: new Date().toISOString(), channel }
                : r
            )
          );
          addAuditLog('SEND_DIRECT_REMINDER', 'Customer', customerId, `Sent direct ${channel} reminder to customer`);
          showToast(`Reminder marked as sent via ${channel}!`);
        }}
      />

      {/* Store Login Modal */}
      <StoreLoginModal
        isOpen={isStoreLoginModalOpen}
        store={store}
        onClose={() => setIsStoreLoginModalOpen(false)}
        onStoreLogin={handleStoreLogin}
      />
    </div>
  );
}
