# Database Schema & Data Models: My Udhari

## Entities & Schemas

### 1. StoreProfile
- `id`: String (PK, e.g. "store-01")
- `name`: String (required, e.g. "Kirana General Store")
- `ownerName`: String (required)
- `phone`: String (required)
- `address`: String
- `upiId`: String (required for payments)
- `pinHash`: String (hashed 4-digit PIN for store owner/staff authentication)
- `reminderIntervalDays`: Number (default: 8)
- `autoRemindersEnabled`: Boolean (default: true)
- `preferredChannel`: Enum ('WHATSAPP' | 'SMS', default: 'WHATSAPP')
- `userRole`: Enum ('Owner' | 'Staff', default: 'Owner')
- `lastBackupDate`: String (ISO 8601)
- `createdAt`: String (ISO 8601)
- `updatedAt`: String (ISO 8601)

### 2. Customer
- `id`: String (PK, e.g. "cust-1")
- `storeId`: String (FK to StoreProfile)
- `name`: String (required, min: 2, max: 100)
- `phone`: String (required, formatted +91 / 10-digits, unique per store)
- `balance`: Number (positive = customer owes store / You will get, negative = advance / You will give, 0 = settled)
- `reminderEnabled`: Boolean (default: true)
- `reminderIntervalDays`: Number (default: 8)
- `lastTransactionDate`: String (ISO 8601)
- `lastReminderSentDate`: String (ISO 8601, optional)
- `createdAt`: String (ISO 8601)
- `updatedAt`: String (ISO 8601)
- `notes`: String (optional)
- `avatarColor`: String (optional)
- `isDeleted`: Boolean (soft delete support, default: false)

### 3. Transaction
- `id`: String (PK, e.g. "tx-1")
- `storeId`: String (FK to StoreProfile)
- `customerId`: String (FK to Customer)
- `customerName`: String (denormalized for display speed)
- `type`: Enum ('CREDIT' | 'PAYMENT')
- `amount`: Number (positive float/int > 0)
- `note`: String (optional, e.g. "Rice 5kg Bag")
- `timestamp`: String (ISO 8601)
- `formattedDate`: String (e.g. "Today", "Yesterday", "2 days ago")
- `formattedTime`: String (e.g. "10:30 AM")
- `createdBy`: Enum ('Owner' | 'Staff')
- `balanceAfter`: Number (balance snapshot immediately after this transaction)
- `createdAt`: String (ISO 8601)

### 4. ReminderJob
- `id`: String (PK, e.g. "rem-1")
- `storeId`: String (FK to StoreProfile)
- `customerId`: String (FK to Customer)
- `customerName`: String
- `phone`: String
- `amount`: Number
- `shopName`: String
- `scheduledDate`: String (ISO 8601)
- `status`: Enum ('SCHEDULED' | 'SENT' | 'DELIVERED' | 'FAILED')
- `channel`: Enum ('WHATSAPP' | 'SMS')
- `sentAt`: String (ISO 8601, optional)
- `failureReason`: String (optional)
- `retries`: Number (default: 0)
- `messageText`: String
- `createdAt`: String (ISO 8601)
- `updatedAt`: String (ISO 8601)

### 5. AuditLog
- `id`: String (PK, e.g. "log-1")
- `storeId`: String (FK)
- `actor`: String (e.g. "Suresh Patel (Owner)", "Automated 8-Day Engine")
- `action`: String (e.g. "RECORD_CREDIT", "RECORD_PAYMENT", "CREATE_CUSTOMER", "DELETE_CUSTOMER", "PROCESS_BATCH_REMINDERS", "SEND_REMINDER", "STORE_LOGIN", "CUSTOMER_LOGIN", "EXPORT_BACKUP", "UPDATE_STORE_SETTINGS")
- `entity`: String (e.g. "Transaction", "Customer", "ReminderJob", "StoreProfile", "System")
- `entityId`: String
- `timestamp`: String (ISO 8601)
- `result`: Enum ('SUCCESS' | 'FAILED')
- `reason`: String (optional)
- `details`: String
- `ipAddress`: String (optional)

### 6. OtpSession (In-Memory / Persistent with TTL)
- `phone`: String (PK)
- `otp`: String
- `customerId`: String
- `expiresAt`: Number (Unix timestamp)
- `attempts`: Number

---

## Indexes & Query Access Patterns
1. `Customer.storeId + Customer.phone`: Quick lookup for customer login & duplicate check.
2. `Transaction.customerId + Transaction.timestamp`: Sorting ledger entries chronologically.
3. `ReminderJob.status + ReminderJob.scheduledDate`: Fast filtering of pending 8-day jobs.
4. `AuditLog.timestamp`: Reverse chronological audit listing.

## Storage Implementation
- Production-grade file-backed atomic repository (`storage/database.json`) using atomic temporary file rename (`fs.promises.writeFile` to tmp + `fs.promises.rename`) preventing corruption on power/process interruption.
- Thread-safe transaction locks ensuring atomic balance updates and race-free khata balance computation.
