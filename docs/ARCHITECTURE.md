# Backend Architecture: My Udhari

## System Architecture Diagram & Layering

```text
┌────────────────────────────────────────────────────────┐
│                   Frontend (/frontend)                 │
│      React 19 + TypeScript + Vite + Tailwind CSS       │
│      (Store Ledger / Customer Passbook UI)             │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON REST API (/api/v1/*)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Backend (/backend)                   │
│                    Express.js Server                   │
│  - CORS & Request Logging                              │
│  - Request Body Parsing (JSON & URL-encoded)           │
│  - Rate Limiting on Auth/OTP Endpoints                 │
│  - Centralized Error Handling & AppError               │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                      API Routes Layer                  │
│  /auth, /store, /customers, /transactions, /reminders, │
│  /reports, /audit, /backup, /ai, /health               │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Middleware Layer                    │
│  - authMiddleware (JWT Verification)                   │
│  - requireRoles(['Owner', 'Staff', 'Customer'])        │
│  - validate(schema) (Request payload validation)       │
│  - rateLimit (Brute force protection)                  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                   Controllers Layer                    │
│  Unpacks request params, invokes services, formats     │
│  standard JSON response envelopes                      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                     Services Layer                     │
│  - AuthService (PIN & OTP verification, JWT token)     │
│  - CustomerService (CRUD, deduplication, balances)     │
│  - TransactionService (Atomic balances, ledgers)       │
│  - ReminderService (8-day rule engine, auto-cancel)    │
│  - ReportService (6-month trends, aging, metrics)      │
│  - AuditService (Immutable event logging)              │
│  - BackupService (Full JSON snapshot, restore, status) │
│  - AiService (Google Gemini GenAI API integration)     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                   Repositories Layer                   │
│  - StoreRepository, CustomerRepository,                │
│    TransactionRepository, ReminderRepository,          │
│    AuditRepository                                     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  Data & Persistence                    │
│  - Thread-Safe Atomic File Persistence Engine          │
│    (backend/data/udhari_db.json)                       │
│  - In-Memory Write-Through Caching & Mutex Locks       │
└────────────────────────────────────────────────────────┘
```

## Directory Separation
- **`backend/`**: Independent service containing server, models, business rules, automated tests, and its own `package.json` + `tsconfig.json`.
- **`frontend/`**: Independent client application with React 19 UI, Vite build tooling, API client, and its own `package.json` + `tsconfig.json`.
- **`docs/`**: Persistent AI context system and domain knowledge.
