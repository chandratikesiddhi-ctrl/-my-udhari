# Backend API Contract: My Udhari

Base URL: `/api/v1`

All responses follow standard envelopes:
```json
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}

// Error Response
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human readable error description",
  "errors": []
}
```

---

## 1. Authentication APIs (`/api/v1/auth`)

### 1.1 Store Staff/Owner PIN Login
- **POST** `/api/v1/auth/store/login`
- **Auth:** Public
- **Request:**
  ```json
  {
    "role": "Owner" | "Staff",
    "pin": "1234"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt_token_here",
      "user": {
        "id": "owner-session",
        "name": "Suresh Patel",
        "phone": "+91 98765 00001",
        "role": "Owner",
        "isLoggedIn": true
      }
    }
  }
  ```

### 1.2 Customer Send OTP
- **POST** `/api/v1/auth/customer/send-otp`
- **Auth:** Public
- **Request:**
  ```json
  {
    "phone": "9876543210"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "phone": "+91 98765 43210",
      "otpExpiresInSeconds": 300,
      "demoOtp": "1234" // Provided in development/demo mode
    },
    "message": "OTP sent successfully"
  }
  ```

### 1.3 Customer Verify OTP & Login
- **POST** `/api/v1/auth/customer/verify-otp`
- **Auth:** Public
- **Request:**
  ```json
  {
    "phone": "9876543210",
    "otp": "1234"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt_token_here",
      "session": {
        "id": "cust-1",
        "name": "Anil Kumar",
        "phone": "+91 98765 43210",
        "role": "Customer",
        "customerId": "cust-1",
        "isLoggedIn": true
      },
      "customer": { ... }
    }
  }
  ```

---

## 2. Store Profile & Configuration APIs (`/api/v1/store`)

### 2.1 Get Store Profile
- **GET** `/api/v1/store/profile`
- **Auth:** Any authenticated user or Public (basic details for customer passbook)
- **Response (200):** `StoreProfile` object.

### 2.2 Update Store Profile
- **PATCH** `/api/v1/store/profile`
- **Auth:** Owner only
- **Request:**
  ```json
  {
    "name": "Kirana General Store",
    "ownerName": "Suresh Patel",
    "phone": "+91 98765 00001",
    "address": "Shop No. 4, Market Road, Pune",
    "upiId": "kiranastore@oksbi",
    "reminderIntervalDays": 8,
    "autoRemindersEnabled": true,
    "preferredChannel": "WHATSAPP",
    "userRole": "Owner"
  }
  ```
- **Response (200):** Updated `StoreProfile`.

---

## 3. Customer Ledger APIs (`/api/v1/customers`)

### 3.1 List Customers
- **GET** `/api/v1/customers?search=&filter=ALL|DUE|SETTLED|ADVANCE&sort=recent|highest_due|name`
- **Auth:** Owner / Staff
- **Response (200):** `Customer[]` with aggregate statistics.

### 3.2 Get Customer By ID
- **GET** `/api/v1/customers/:id`
- **Auth:** Owner / Staff, or Customer matching `:id`
- **Response (200):** Customer details + latest transaction summary.

### 3.3 Create Customer
- **POST** `/api/v1/customers`
- **Auth:** Owner / Staff
- **Request:**
  ```json
  {
    "name": "Ramesh Kumar",
    "phone": "+91 98450 99881",
    "initialBalance": 450,
    "reminderEnabled": true,
    "notes": "Regular customer"
  }
  ```
- **Response (201):** Created `Customer` object + initial transaction if initialBalance != 0.

### 3.4 Update Customer Reminder Preferences
- **PATCH** `/api/v1/customers/:id/reminder-preference`
- **Auth:** Owner / Staff
- **Request:**
  ```json
  {
    "reminderEnabled": true,
    "reminderIntervalDays": 8
  }
  ```
- **Response (200):** Updated `Customer` object.

### 3.5 Delete Customer
- **DELETE** `/api/v1/customers/:id`
- **Auth:** Owner only
- **Response (200):** `{ "success": true, "message": "Customer deleted" }`

---

## 4. Transactions APIs (`/api/v1/transactions`)

### 4.1 Record Transaction (Credit or Payment)
- **POST** `/api/v1/transactions`
- **Auth:** Owner / Staff
- **Request:**
  ```json
  {
    "customerId": "cust-1",
    "type": "CREDIT" | "PAYMENT",
    "amount": 450,
    "note": "Daily Groceries & Tea"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "transaction": { ... },
      "customer": { ... }
    },
    "message": "Credit of ₹450 recorded successfully"
  }
  ```

### 4.2 List Transactions for Customer
- **GET** `/api/v1/transactions?customerId=cust-1&type=ALL|CREDIT|PAYMENT&search=`
- **Auth:** Owner / Staff, or Customer matching `customerId`
- **Response (200):** `Transaction[]`

---

## 5. Automated 8-Day Reminders APIs (`/api/v1/reminders`)

### 5.1 List Reminder Jobs
- **GET** `/api/v1/reminders?status=ALL|SCHEDULED|SENT|FAILED`
- **Auth:** Owner / Staff
- **Response (200):** `{ jobs: ReminderJob[], summary: { scheduledCount, sentCount, failedCount } }`

### 5.2 Scan & Generate 8-Day Reminders
- **POST** `/api/v1/reminders/scan`
- **Auth:** Owner / Staff
- **Response (200):** List of newly scheduled jobs.

### 5.3 Batch Process Scheduled Reminders
- **POST** `/api/v1/reminders/batch-send`
- **Auth:** Owner / Staff
- **Response (200):** `{ processedCount: 4, jobs: [...] }`

### 5.4 Send or Retry Single Reminder
- **POST** `/api/v1/reminders/:id/send`
- **POST** `/api/v1/reminders/:id/retry`
- **Auth:** Owner / Staff
- **Response (200):** Updated `ReminderJob`.

---

## 6. Reports & Analytics APIs (`/api/v1/reports`)

### 6.1 Get Full Analytics Dashboard
- **GET** `/api/v1/reports/summary`
- **Auth:** Owner / Staff
- **Response (200):**
  ```json
  {
    "totalOutstanding": 12850,
    "totalCreditGiven": 45000,
    "totalPaymentsReceived": 32150,
    "recoveryRate": 71,
    "activeDebtorsCount": 7,
    "settledCount": 3,
    "monthlyBreakdown": [ ...6 months of data... ],
    "agingBreakdown": {
      "fresh": { "count": 3, "amount": 2550 },
      "due": { "count": 2, "amount": 4250 },
      "overdue": { "count": 2, "amount": 6050 }
    }
  }
  ```

### 6.2 Export CSV Ledger
- **GET** `/api/v1/reports/export-csv`
- **Auth:** Owner / Staff
- **Response (200):** `text/csv` attachment file.

---

## 7. Audit & Backup APIs (`/api/v1/audit` & `/api/v1/backup`)

### 7.1 List Audit Logs
- **GET** `/api/v1/audit/logs?limit=100`
- **Auth:** Owner only
- **Response (200):** `AuditLog[]`

### 7.2 Export Full JSON Backup
- **GET** `/api/v1/backup/export`
- **Auth:** Owner only
- **Response (200):** Complete JSON backup with store, customers, transactions, reminders, auditLogs.

### 7.3 Reset Demo Data
- **POST** `/api/v1/backup/reset-demo`
- **Auth:** Owner only
- **Response (200):** Fresh mock dataset restored.

---

## 8. AI Intelligence APIs (`/api/v1/ai`)

### 8.1 Generate Personalized Reminder Message
- **POST** `/api/v1/ai/generate-reminder`
- **Auth:** Owner / Staff
- **Request:**
  ```json
  {
    "customerName": "Anil Kumar",
    "amount": 850,
    "daysOverdue": 9,
    "language": "mr" | "en",
    "tone": "polite" | "firm" | "festive"
  }
  ```
- **Response (200):** `{ "message": "..." }`

### 8.2 Generate Credit Health Insights
- **GET** `/api/v1/ai/insights`
- **Auth:** Owner / Staff
- **Response (200):** AI summary of collection performance, high-risk balances, and suggested actions.
