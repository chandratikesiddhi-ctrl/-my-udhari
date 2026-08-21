# Testing Strategy: My Udhari

## Testing Scope & Pyramid

```text
       ▲
      / \     E2E / API Integration Tests (Auth, Khata, Reminders, Backup)
     /   \    Service Layer & Business Rules Tests (Balance arithmetic, 8-day engine)
    /_____\   Unit Tests (Validators, Formatters, Encryption, Utility Functions)
```

## Critical Test Suites

1. **Authentication Tests:**
   - Owner PIN login with valid PIN -> returns token + Owner session.
   - Staff PIN login -> returns token + Staff session.
   - Invalid PIN -> returns 400 `INVALID_CREDENTIALS`.
   - Customer OTP generation -> creates valid session.
   - Customer OTP verification -> verifies and issues scoped token.

2. **Customer Ledger & Khata Tests:**
   - Create customer with initial credit -> verifies opening balance and initial transaction.
   - Duplicate phone prevention -> returns 400 `DUPLICATE_PHONE`.
   - Update reminder preference -> reflects in customer record.
   - Delete customer -> cascades to cleanup transactions and pending reminders.

3. **Transaction Arithmetic Tests (BR-001):**
   - Record credit -> increases balance atomically.
   - Record payment -> decreases balance atomically.
   - Balance snapshot (`balanceAfter`) matches arithmetic exactly.
   - Overpayment resulting in negative balance is supported (advance).

4. **8-Day Automated Reminder Engine Tests (BR-002 & BR-003):**
   - Customer with balance > 0 and last activity >= 8 days -> flagged eligible.
   - Batch dispatch -> marks scheduled reminders as SENT.
   - Full payment clearance (balance <= 0) -> automatically cancels pending scheduled reminder jobs.

5. **Customer Passbook Isolation Tests (BR-004):**
   - Authenticated customer cannot query other customer's transactions.
   - Passbook statement contains only caller's entries.

6. **Backup & Audit Tests (BR-007 & BR-008):**
   - Audit trail captures all state transitions with actor and timestamp.
   - JSON backup export contains valid full database snapshot.
