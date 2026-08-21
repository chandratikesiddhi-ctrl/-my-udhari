# System Requirements: My Udhari

## Structured Requirements

### REQ-001: Store Profile & Policy Management
- **Description:** Store owners can view and update shop details (name, owner name, phone, address, UPI ID) and configure reminder policies (reminder interval days, auto-reminders toggle, preferred communication channel).
- **Source:** PRD Section 9.8, Settings Screen
- **Priority:** High
- **Backend Impact:** Store Profile Model, Controller, Service, and Routes (`/api/v1/store`).
- **Status:** Pending

### REQ-002: Dual Authentication & Role-Based Access
- **Description:** Store Owner and Staff log in via 4-digit PIN with JWT token issuance. Customers authenticate via 10-digit mobile number and 4-digit OTP to access their own passbook.
- **Source:** PRD Section 10 & 14, StoreLoginModal, CustomerLoginScreen
- **Priority:** Critical
- **Backend Impact:** Auth Controller, Service, JWT Middleware, OTP Generation/Verification (`/api/v1/auth`).
- **Status:** Pending

### REQ-003: Customer Directory & Khata Management
- **Description:** Store owners and staff can create, read, update, search, filter, and delete customers. Opening balance creates an opening transaction. Phone number deduplication is enforced.
- **Source:** PRD Section 10, CustomerListScreen, AddCustomerModal, CustomerDetailScreen
- **Priority:** Critical
- **Backend Impact:** Customer Model, Repository, Service, Controller, Routes (`/api/v1/customers`).
- **Status:** Pending

### REQ-004: Atomic Transaction Recording & Balance Engine
- **Description:** Recording a CREDIT increases balance; recording a PAYMENT decreases balance. The transaction record stores `balanceAfter`, `createdBy`, timestamp, and note atomically with the customer balance.
- **Source:** PRD Section 11, TransactionModal, CustomerDetailScreen
- **Priority:** Critical
- **Backend Impact:** Transaction Model, Repository, Service, Controller, Routes (`/api/v1/transactions`).
- **Status:** Pending

### REQ-005: Automated 8-Day Follow-Up & Reminder Engine
- **Description:** The system identifies customers with positive balances who have had no payments for >= 8 days (or configured interval). Schedules reminder jobs. Triggers batch or single dispatch. Automatically removes pending scheduled reminders when balance is settled to <= 0.
- **Source:** PRD Section 9.8, 9.9, 11.4, 11.5, RemindersScreen, ReminderMessageModal
- **Priority:** High
- **Backend Impact:** ReminderJob Model, Scheduler Service, Controller, Routes (`/api/v1/reminders`).
- **Status:** Pending

### REQ-006: Customer Passbook Portal & Isolation
- **Description:** Authenticated customers can view only their personal transaction history, current balance status, store UPI payment link/QR details, and export their passbook statement.
- **Source:** PRD Section 14, CustomerDashboard
- **Priority:** High
- **Backend Impact:** Customer-scoped API endpoints (`/api/v1/customer/passbook`), passbook statement generator.
- **Status:** Pending

### REQ-007: Financial Analytics & Aging Reports
- **Description:** Aggregates total outstanding, total collected, 6-month monthly cash flow breakdown (credits vs payments), recovery rate calculation, and customer debt aging classification (<8 days, 8-15 days, >=16 days). Supports CSV export.
- **Source:** PRD Section 12, ReportsScreen
- **Priority:** Medium
- **Backend Impact:** Analytics Service & Controller (`/api/v1/reports`).
- **Status:** Pending

### REQ-008: Comprehensive Audit Logging
- **Description:** Tracks all financial transactions, customer creation/deletion, reminder batch operations, backup exports, and login sessions with actor, entity, status, and timestamp.
- **Source:** PRD Section 14.7 & 18, SettingsScreen
- **Priority:** High
- **Backend Impact:** AuditLog Model, Audit Service, Controller, Middleware (`/api/v1/audit`).
- **Status:** Pending

### REQ-009: Backup Management & 7-Day Overdue Flagging
- **Description:** Tracks `lastBackupDate`. Flags overdue warning if >7 days have elapsed. Allows full JSON backup export and data restoration/reset.
- **Source:** PRD Section 13, SettingsScreen
- **Priority:** Medium
- **Backend Impact:** Backup Service & Controller (`/api/v1/backup`).
- **Status:** Pending

### REQ-010: AI Intelligence & Multilingual Reminders (Gemini)
- **Description:** Server-side Gemini API integration for generating polite, context-aware payment reminders in Marathi and English and summarizing store credit health.
- **Source:** `metadata.json`, PRD Section 9.9
- **Priority:** Medium
- **Backend Impact:** Gemini Integration Service (`/api/v1/ai`).
- **Status:** Pending
