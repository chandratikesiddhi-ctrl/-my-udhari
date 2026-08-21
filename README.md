# My Udhari (माझे उधारी / मेरा उधार)

Production-grade digital credit and khata management system with automated 8-day reminders, customer passbook, reports, audit trail, backup management, and AI assistance for grocery stores and small retailers.

---

## 📁 Repository Structure

```text
-my-udhari/
├── backend/                  # Standalone Backend Service (Node.js, Express, TypeScript)
│   ├── src/
│   │   ├── config/           # Database & environment configuration
│   │   ├── constants/        # System constants & error codes
│   │   ├── controllers/      # Route handlers
│   │   ├── middlewares/      # Auth, roles, validation, rate limiting, error handling
│   │   ├── repositories/     # Database access abstraction
│   │   ├── routes/           # API routes (/api/v1/*)
│   │   ├── services/         # Business logic (Auth, Transactions, 8-Day Reminders, Reports, AI)
│   │   ├── types/            # TypeScript domain models
│   │   ├── utils/            # Crypto, formatters, errors
│   │   ├── app.ts            # Express application bootstrap
│   │   └── server.ts         # Server entrypoint
│   ├── tests/                # Unit, integration, and runner tests
│   ├── data/                 # Atomic database storage
│   ├── package.json          # Backend-specific dependencies & scripts
│   ├── tsconfig.json         # Backend TypeScript config
│   ├── .env.example          # Backend environment variables
│   └── README.md             # Backend documentation
│
├── frontend/                 # Standalone Frontend Application (React 19, Vite, Tailwind CSS)
│   ├── src/
│   │   ├── components/       # UI screens & modals (Home, Khata, Passbook, Reminders, Reports, Settings)
│   │   ├── context/          # LanguageContext (English & Marathi)
│   │   ├── data/             # Initial mock models
│   │   ├── services/         # API client connecting to /api/v1/*
│   │   ├── utils/            # Formatters & UI helpers
│   │   ├── App.tsx           # Main application router
│   │   └── main.tsx          # React entrypoint
│   ├── index.html            # Web app entry HTML
│   ├── vite.config.ts        # Vite config with API proxy
│   ├── package.json          # Frontend-specific dependencies & scripts
│   ├── tsconfig.json         # Frontend TypeScript config
│   ├── .env.example          # Frontend environment variables
│   └── README.md             # Frontend documentation
│
├── docs/                     # Persistent AI Context System & Architecture Specifications
│   ├── CONTEXT.md
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACT.md
│   ├── DATABASE.md
│   ├── DECISIONS.md
│   ├── BUSINESS_RULES.md
│   ├── SECURITY.md
│   ├── ERROR_HANDLING.md
│   ├── VALIDATION.md
│   ├── TESTING.md
│   ├── DEPLOYMENT.md
│   ├── CHANGELOG.md
│   ├── TODO.md
│   └── MEMORY.md
│
├── package.json              # Root workspace orchestrator
└── README.md                 # Main project README
```

---

## 🚀 Quick Start

### 1. Run Everything from Root
```bash
# Start backend server
npm run dev:backend

# Start frontend application (in another terminal)
npm run dev:frontend

# Run all backend tests
npm run test:backend
```

### 2. Run Backend Standalone
```bash
cd backend
npm run dev      # Starts API server on http://localhost:3001
npm test         # Runs test suite (100% pass)
```

### 3. Run Frontend Standalone
```bash
cd frontend
npm run dev      # Starts Vite dev server on http://localhost:3000
```

---

## 📚 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/health` | Service health check | Public |
| `POST` | `/api/v1/auth/store/login` | Store Owner / Staff PIN login | Public |
| `POST` | `/api/v1/auth/customer/send-otp` | Customer mobile OTP dispatch | Public |
| `POST` | `/api/v1/auth/customer/verify-otp` | Customer OTP verification & passbook login | Public |
| `GET` | `/api/v1/store/profile` | Get store info & backup status | Public / Customer |
| `PATCH` | `/api/v1/store/profile` | Update store configuration | Owner |
| `GET` | `/api/v1/customers` | List/search/filter customers | Owner / Staff |
| `POST` | `/api/v1/customers` | Register new customer account | Owner / Staff |
| `PATCH` | `/api/v1/customers/:id/reminder-preference` | Update customer reminder interval/toggle | Owner / Staff |
| `DELETE` | `/api/v1/customers/:id` | Delete customer & cascade records | Owner |
| `POST` | `/api/v1/transactions` | Record Credit or Payment with balance updates | Owner / Staff |
| `GET` | `/api/v1/transactions` | List ledger entries (customer-scoped) | Authenticated |
| `GET` | `/api/v1/reminders` | List scheduled/sent/failed reminders | Owner / Staff |
| `POST` | `/api/v1/reminders/scan` | Scan ledger for eligible 8-day reminders | Owner / Staff |
| `POST` | `/api/v1/reminders/batch-send` | Dispatch scheduled 8-day reminders | Owner / Staff |
| `POST` | `/api/v1/reminders/:id/send` | Dispatch single reminder | Owner / Staff |
| `POST` | `/api/v1/reminders/:id/retry` | Retry failed reminder | Owner / Staff |
| `GET` | `/api/v1/reports/summary` | 6-month trends & debt aging breakdown | Owner / Staff |
| `GET` | `/api/v1/reports/export-csv` | Download CSV ledger export | Owner / Staff |
| `GET` | `/api/v1/audit/logs` | View immutable audit trail | Owner |
| `GET` | `/api/v1/backup/export` | Full JSON database backup snapshot | Owner |
| `POST` | `/api/v1/backup/reset-demo` | Restore initial demo data | Owner |
| `POST` | `/api/v1/ai/generate-reminder` | Generate Gemini AI personalized reminder | Owner / Staff |
| `GET` | `/api/v1/ai/insights` | Get Gemini AI credit health insights | Owner / Staff |
