# Security & Authorization Policy: My Udhari

## 1. Authentication & Token Management
- **Store Auth:** Store owner and staff authenticate using 4-digit PINs. Passwords/PINs are hashed using cryptographic one-way hashing (PBKDF2/SHA256 with salt) before persistence.
- **Customer Auth:** Customers authenticate via 10-digit mobile phone and short-lived OTP (5-minute expiry, max 3 attempts).
- **JWT (JSON Web Tokens):**
  - Signed with high-entropy `JWT_SECRET` (configured via environment variable).
  - Explicit expiration times: 7 days for store sessions, 24 hours for customer passbook sessions.
  - Payloads contain `{ id, role, phone, customerId?, storeId }`.

## 2. Authorization & Tenant Isolation
- **Role Verification:** `requireRole(['Owner'])` middleware blocks unauthorized staff/customer access from critical administrative operations (settings, customer deletion, data export/reset).
- **Object-Level Access Control:** Customer-scoped endpoints (`/api/v1/customer/*`) strictly enforce `req.user.customerId === resource.customerId`.
- **Client Identity Spoofing Prevention:** The backend never trusts client-supplied `role`, `createdBy`, or `customerId` from request bodies; these values are exclusively resolved from verified JWT session claims.

## 3. Input Validation & Sanitization
- All incoming request payloads (body, query, params) are validated using rigorous schema validators before hitting controllers.
- String fields are trimmed, length-bounded, and sanitized against injection.
- Financial numbers are checked for `amount > 0` and finite floating-point boundaries.

## 4. Rate Limiting & Abuse Prevention
- Rate limiting middleware applied to authentication routes (`/api/v1/auth/*`) to mitigate brute-force PIN guessing and OTP flooding.
- Resend OTP requests enforce a minimum 30-second cooldown per phone number.

## 5. Security Headers & CORS
- Helmet middleware enabled for standard security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`).
- CORS configured to whitelist frontend origin and block unauthorized cross-origin requests.

## 6. Secret Management & Information Leakage Prevention
- Zero secrets committed to git or exposed in client bundles.
- Centralized error handlers strip internal error stacks, file paths, and database internals in production responses.
- Audit logs sanitize any sensitive credentials or tokens.
