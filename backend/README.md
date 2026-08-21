# My Udhari Backend Service

Production-ready modular REST API for My Udhari digital credit & khata ledger application.

---

## 🏗️ Architecture

Layered architecture:
```text
Routes → Middlewares → Controllers → Services → Repositories → Persistence
```

- **Runtime:** Node.js + Express.js + TypeScript
- **Auth:** Dual PIN (Owner/Staff) + Mobile OTP (Customer Passbook) with JWTs
- **Persistence:** Thread-safe Atomic File JSON Database (`data/udhari_db.json`)
- **AI:** Google GenAI Gemini SDK (`@google/genai`)

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run dev server with auto-reload
npm run dev

# Run test suite
npm test
```

Server runs on `http://localhost:3001/api/v1`.
Health check: `http://localhost:3001/api/v1/health`.
