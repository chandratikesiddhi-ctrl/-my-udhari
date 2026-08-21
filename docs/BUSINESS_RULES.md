# Business Rules Specification: My Udhari

## BR-001: Balance Arithmetic & Atomic Ledger Integrity
- Every CREDIT transaction increases the customer's outstanding balance:
  $$\text{NewBalance} = \text{OldBalance} + \text{CreditAmount}$$
- Every PAYMENT transaction decreases the customer's outstanding balance:
  $$\text{NewBalance} = \text{OldBalance} - \text{PaymentAmount}$$
- Customer balances can be:
  - Positive (> 0): Customer owes store ("You will get" / उधारी बाकी).
  - Negative (< 0): Store owes customer / Advance deposit ("You will give" / ॲडव्हान्स जमा).
  - Zero (0): Account fully settled (हिशोब पूर्ण).
- Updating balance and writing transaction records must be atomic.

## BR-002: Automated 8-Day Follow-Up Policy (PRD Section 9.8 & 11.4)
- A customer is eligible for an automated 8-day payment reminder if:
  1. `customer.reminderEnabled === true`
  2. `customer.balance > 0`
  3. `Date.now() - customer.lastTransactionDate >= customer.reminderIntervalDays` (Default: 8 days)
  4. No active reminder has already been sent within the last `reminderIntervalDays`.

## BR-003: Auto-Cancellation of Reminders on Settlement (PRD Section 11.5)
- When a payment transaction is recorded that brings a customer's balance to `<= 0`, the backend MUST immediately query and cancel / remove any pending `SCHEDULED` reminder jobs for that customer.

## BR-004: Customer Passbook Privacy & Data Isolation (PRD Section 14)
- A customer logging in with their phone number can ONLY access their own passbook transactions, balance, and store payment details. They must not receive or query other customers' balances or contact numbers.

## BR-005: Role-Based Permissions & Guardrails
- **Owner Role:** Full administrative rights:
  - Create, view, update, delete customers.
  - Record credits and payments.
  - Trigger and manage reminders.
  - Update store settings, UPI ID, and reminder policies.
  - View full audit trail and export JSON backups.
  - Reset demo data.
- **Staff Role:**
  - View customer list and ledger.
  - Record credits and payments (attributed as `createdBy: 'Staff'`).
  - View reminder schedule.
  - **Restricted from:** Deleting customers, altering store configuration/PIN, deleting data, and resetting system.

## BR-006: Phone Number Validation & Deduplication (PRD Section 10)
- Customer phone numbers must be valid 10-digit Indian numbers (or standard formatted `+91 XXXXX XXXXX`).
- A store cannot have two active customers with the exact same 10-digit normalized phone number.

## BR-007: Comprehensive Audit Trail (PRD Section 14.7 & 18)
- Every transaction (CREDIT/PAYMENT), customer lifecycle event (CREATE/DELETE/UPDATE), reminder dispatch, and authentication event MUST generate an immutable `AuditLog` entry detailing the actor, action, timestamp, entity, and status.

## BR-008: 7-Day Backup Warning Policy (PRD Section 13)
- The system checks `lastBackupDate`. If the elapsed time since the last full JSON backup export exceeds 7 days, an overdue backup alert state is flagged for the store owner.
