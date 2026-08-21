# Changelog: My Udhari

## [2026-08-21]

### Added:
- Clean architectural separation of **Frontend** (`frontend/`) and **Backend** (`backend/`):
  - **`backend/`**: Standalone Node.js + Express + TypeScript service with independent `package.json`, `tsconfig.json`, `.env.example`, `src/`, `tests/`, `data/`, and `README.md`.
  - **`frontend/`**: Standalone React 19 + Vite + Tailwind CSS client with independent `package.json`, `tsconfig.json`, `.env.example`, `src/`, `index.html`, `vite.config.ts`, and `README.md`.
  - **Root Orchestration:** Workspace-ready root `package.json` with scripts to run services individually or concurrently.
- Complete modular production-ready backend in TypeScript (`backend/src/*`):
  - **Config & Infrastructure:** `env.ts`, `logger.ts`, `database.ts` (atomic thread-safe JSON persistence).
  - **Middlewares:** `auth.ts` (JWT verification), `roles.ts` (Owner, Staff, Customer), `validate.ts`, `rateLimit.ts`, `errorHandler.ts`, `requestLogger.ts`, `cors.ts`.
  - **Repositories:** `store.repository.ts`, `customer.repository.ts`, `transaction.repository.ts`, `reminder.repository.ts`, `audit.repository.ts`.
  - **Services:** `auth.service.ts`, `store.service.ts`, `customer.service.ts`, `transaction.service.ts`, `reminder.service.ts`, `report.service.ts`, `audit.service.ts`, `backup.service.ts`, `ai.service.ts`.
  - **Controllers & Master Routes:** 22 REST endpoints covering `/api/v1/*`.
  - **AI Integration:** Google Gemini GenAI SDK (`@google/genai`) for smart multilingual reminder generation and credit health insights.
  - **Automated Test Suites:** Auth, Transaction Engine, 8-Day Reminder Engine, and API Integration tests in `backend/tests/*` (100% pass).
  - **Frontend Integration:** API Client `src/services/api.ts` and Vite dev proxy configuration in `vite.config.ts`.
  - **Documentation & Tracking:** `README.md`, `MEMORY.md`, `TODO.md`, `CHANGELOG.md`, and 14 persistent context documents in `/docs`.
