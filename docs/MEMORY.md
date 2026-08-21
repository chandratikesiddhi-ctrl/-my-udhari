# PROJECT MEMORY

## Current State
- Backend status: Fully Implemented, Tested & Separated
- Frontend status: Cleanly Separated into `frontend/`
- Current phase: Complete Monorepo / Multi-Package Setup

## Completed
- Separation of backend and frontend:
  - `backend/`: Standalone Express TypeScript backend with `package.json`, `tsconfig.json`, `.env.example`, `src/`, `tests/`, `data/`, `README.md`.
  - `frontend/`: Standalone React 19 + Vite frontend with `package.json`, `tsconfig.json`, `.env.example`, `src/`, `index.html`, `vite.config.ts`, `README.md`.
  - Root: Workspaces orchestration via root `package.json` and unified `README.md`.
- Persistent Context System in `/docs` (14 documents updated).
- Complete Layered Backend Architecture (`Routes → Controllers → Services → Repositories → Persistence`).
- Automated Test Suite (100% pass across Auth, Transactions, 8-Day Reminders, API Integration).

## In Progress
- None

## Important Decisions
- **DEC-001:** Layered modular TypeScript architecture.
- **DEC-002:** Dual Auth (PIN for shopkeepers, Mobile OTP for customers).
- **DEC-003:** Thread-safe atomic file-backed JSON database with repository abstraction.
- **DEC-004:** 8-day reminder engine with automatic cancellation on balance $\le 0$.
- **DEC-005:** Unified response envelope (`{ success, data, message, code, errors }`).
- **DEC-006:** Clean directory separation (`backend/` and `frontend/`) with independent packages and root workspace orchestration.

## Important Constraints
- Independent `package.json` for frontend and backend.
- Zero external database server prerequisites.
- Backward compatibility with existing frontend state models.

## Known Issues
- None

## Next Actions
- Start backend: `npm run dev:backend` or `cd backend && npm run dev`
- Start frontend: `npm run dev:frontend` or `cd frontend && npm run dev`

## Important Files
- `backend/src/server.ts`: Backend entrypoint
- `backend/tests/runner.ts`: Backend test runner
- `frontend/src/App.tsx`: Frontend main application
- `frontend/src/services/api.ts`: Frontend API client
- `README.md`: Master project guide
