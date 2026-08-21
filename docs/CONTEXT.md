# AI Context: My Udhari (माझे उधारी / मेरा उधार)

## Project Overview
- **Project Name:** My Udhari (Digital Credit & Khata Management)
- **Purpose:** Production-grade digital khata, credit ledger, customer passbook, and automated 8-day payment reminder engine tailored for grocery (kirana) stores and small retailers.
- **Target Users:** Kirana / Retail Store Owners, Shop Staff, and Retail Customers (Passbook Viewers).

## Technology Stack
- **Backend Runtime:** Node.js (v20+) with TypeScript / Express.js (Modular Layered Architecture: Routes -> Controllers -> Services -> Repositories -> Models/Storage).
- **Frontend Framework:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts.
- **AI Integration:** Google Gemini GenAI SDK (`@google/genai`) for smart ledger summaries and personalized reminder messages in Marathi/English.
- **Authentication:** Dual Auth Strategy — PIN-based JWT authentication for Store Owners & Staff; Mobile OTP verification with customer-scoped JWT for Customer Passbook access.
- **Storage/Persistence:** File-backed robust atomic JSON database with concurrency safety and in-memory caching (with clean repository abstraction for zero-friction swap to SQLite/PostgreSQL/MongoDB in production).

## Core Modules
1. **Auth & Identity:** Owner/Staff PIN login and Customer Mobile OTP authentication.
2. **Store & Settings:** Store profile, UPI configuration, 8-day reminder policy, 7-day backup monitor, JSON backup export/restore, demo reset.
3. **Customer Ledger:** Customer CRUD, phone deduplication, balance tracking (Credit/Payment/Advance/Settled), notes.
4. **Transactions Engine:** Atomic credit issuance & payment recording with balance calculation, ledger entries, and audit trail.
5. **8-Day Reminder Engine:** Periodic and batch scanning for >8 days overdue balances, reminder job scheduling, WhatsApp & SMS dispatch links, automatic cancellation on payment clearance (PRD 11.5).
6. **Customer Passbook Portal:** Scoped self-service portal for customers to view ledger records, download passbook statements, and make UPI payments.
7. **Reports & Analytics:** 6-month cash flow trends, recovery rates, aging breakdown (<8d, 8-15d, >16d), and CSV ledger export.
8. **Audit Trail:** Immutable event log tracking all financial, administrative, reminder, and authentication actions (PRD 14.7 & 18).
9. **AI Assistant:** Gemini-powered ledger health analysis and multilingual polite reminder generator.

## Current Development Phase
- Phase 1: Context System & Documentation (Completed)
- Phase 2: Implementation Plan & Architecture Approval (In Progress)
- Phase 3: Core Backend Implementation & Verification (Pending)
