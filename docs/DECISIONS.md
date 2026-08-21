# Architecture Decision Log: My Udhari

## DEC-001: Backend Architecture & Technology Choice
- **Decision:** Implement a modular Express.js backend using clean layer separation (Routes → Controllers → Services → Repositories → Models/Storage) in TypeScript.
- **Why:** Delivers strict type safety, clean separation of concerns, testability, and seamless integration with existing Vite/React frontend and `@google/genai` SDK.
- **Alternatives considered:** Next.js fullstack (would require rewriting existing Vite frontend), FastAPI (introduces Python dependency while node ecosystem is already standard for this project).
- **Impact:** Unified Node.js development, fast execution, consistent typing across frontend and backend.
- **Date:** 2026-08-21

## DEC-002: Dual Authentication Strategy
- **Decision:** Use 4-digit PIN authentication for Store Owner and Staff (with hashed PIN and role-scoped JWT), and Mobile OTP authentication with customer-scoped JWT for Customer Passbook access.
- **Why:** Matches the exact kirana store operational workflow: quick 4-digit PIN for busy shopkeepers, and frictionless mobile phone + OTP for retail customers.
- **Alternatives considered:** Password/email authentication (unsuitable for kirana shopkeeper & customer demographics).
- **Impact:** High adoption, intuitive security, strictly scoped passbook tokens.
- **Date:** 2026-08-21

## DEC-003: Storage & Persistence Engine
- **Decision:** Implement an atomic JSON file storage engine with memory caching, mutex locks, and repository abstraction interfaces.
- **Why:** Zero external database server setup requirement for local development/deployment while providing strict ACID-like atomic writes, write-through caching, and clean repository interfaces that allow switching to PostgreSQL/MongoDB/SQLite in 1 file change.
- **Alternatives considered:** SQLite native addon (risk of binary compilation issues on diverse Windows/Linux environments).
- **Impact:** Reliable, portable, self-contained data store with zero native build prerequisites.
- **Date:** 2026-08-21

## DEC-004: 8-Day Automated Reminder Life Cycle & Cancellation
- **Decision:** 8-day reminder jobs are generated based on `lastTransactionDate` / `lastReminderSentDate` delta >= `reminderIntervalDays` (8 days). When a customer settles dues (balance <= 0), all pending `SCHEDULED` reminder jobs are immediately and automatically cancelled.
- **Why:** Strict adherence to PRD Section 9.8 & 11.5, preventing awkward payment reminders to customers who have already cleared their credit.
- **Alternatives considered:** Manual reminder deletion only (leads to customer friction if reminders go out after settlement).
- **Impact:** Automated khata accuracy and professional customer communication.
- **Date:** 2026-08-21

## DEC-005: Unified API Contract & Error Envelopes
- **Decision:** All endpoints return `{ success: true, data: ..., message: ... }` for success and `{ success: false, code: "...", message: "...", errors: [...] }` for failures.
- **Why:** Consistent frontend error handling, predictable response decoding, and robust UI toast / notification display.
- **Alternatives considered:** Ad-hoc raw payloads (prone to frontend parsing breakage).
- **Impact:** Production-grade developer experience and predictable client integrations.
- **Date:** 2026-08-21
