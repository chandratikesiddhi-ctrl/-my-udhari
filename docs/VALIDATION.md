# Input Validation Rules: My Udhari

## Field-Level Validation Rules

### StoreProfile
- `name`: String, 2 to 100 characters, required.
- `ownerName`: String, 2 to 100 characters, required.
- `phone`: String, 10 to 15 digits/characters, valid phone format.
- `address`: String, max 255 characters, optional.
- `upiId`: String, valid UPI VPA format (e.g., `user@bank` or `name@okhdfcbank`), max 100 characters.
- `reminderIntervalDays`: Integer, min: 1, max: 90 (Default: 8).
- `autoRemindersEnabled`: Boolean.
- `preferredChannel`: Enum (`'WHATSAPP' | 'SMS'`).
- `pin`: String, exactly 4 digits.

### Customer
- `name`: String, 2 to 100 characters, trimmed, required.
- `phone`: String, 10-digit numeric or `+91 XXXXX XXXXX`, required.
- `initialBalance`: Finite number (can be 0, positive, or negative).
- `reminderEnabled`: Boolean (Default: true).
- `reminderIntervalDays`: Integer, min: 1, max: 90 (Default: 8).
- `notes`: String, max 500 characters, optional.

### Transaction
- `customerId`: String (UUID/ID format), non-empty, must match existing customer.
- `type`: Enum (`'CREDIT' | 'PAYMENT'`), required.
- `amount`: Positive finite number > 0. Max: 10,000,000.
- `note`: String, max 200 characters, optional.

### ReminderJob
- `jobId`: String, non-empty.
- `channel`: Enum (`'WHATSAPP' | 'SMS'`).
- `status`: Enum (`'SCHEDULED' | 'SENT' | 'DELIVERED' | 'FAILED'`).

### Authentication
- `pin`: Exactly 4 numeric digits.
- `role`: Enum (`'Owner' | 'Staff'`).
- `otp`: Exactly 4 numeric digits.
