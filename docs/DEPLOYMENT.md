# Deployment & Configuration Guide: My Udhari

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default / Example | Required |
|---|---|---|---|
| `PORT` | HTTP Server port | `3001` | No |
| `NODE_ENV` | Environment mode (`development` \| `production` \| `test`) | `development` | No |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `my-udhari-super-secret-jwt-key-2026` | Yes |
| `GEMINI_API_KEY` | Google Gemini AI API key for smart reminders | User Secret / injected | No (Graceful fallback) |
| `APP_URL` | Base application URL for callbacks and public links | `http://localhost:3000` | No |
| `DEFAULT_PIN` | Default 4-digit PIN for store owner/staff | `1234` | No |

### Frontend (`frontend/.env`)
| Variable | Description | Default / Example | Required |
|---|---|---|---|
| `VITE_APP_URL` | Frontend URL | `http://localhost:3000` | No |
| `VITE_API_URL` | Backend API URL | `/api/v1` | No |

---

## Build & Run Commands

### 1. Root Workspace Commands
```bash
# Run backend server
npm run dev:backend

# Run frontend client
npm run dev:frontend

# Run backend test suite
npm run test:backend
```

### 2. Standalone Backend
```bash
cd backend
npm run dev      # Auto-reloading dev server
npm test         # Execute test suite
npm run start    # Production start
```

### 3. Standalone Frontend
```bash
cd frontend
npm run dev      # Vite dev server on port 3000
npm run build    # Production build to dist/
```

---

## Health Checks & Monitoring
- Endpoint: `GET /api/v1/health`
- Response:
  ```json
  {
    "status": "healthy",
    "uptime": 1245.8,
    "timestamp": "2026-08-21T11:30:00.000Z",
    "version": "1.0.0",
    "database": "connected"
  }
  ```
