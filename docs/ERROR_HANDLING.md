# Error Handling & Standard Error Codes: My Udhari

## Standard Error Response Format

All backend errors return consistent JSON envelopes:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "User-friendly description of the error",
  "errors": [
    {
      "field": "phone",
      "message": "Must be a valid 10-digit mobile number"
    }
  ]
}
```

## Standard Error Codes

| HTTP Status | Error Code | Description |
|---|---|---|
| 400 | `BAD_REQUEST` | General bad request or malformed payload |
| 400 | `VALIDATION_ERROR` | Schema validation failure for fields |
| 400 | `INVALID_CREDENTIALS` | Invalid PIN or OTP code |
| 400 | `DUPLICATE_PHONE` | Customer with this phone number already exists |
| 400 | `OTP_EXPIRED` | OTP code has expired |
| 401 | `UNAUTHORIZED` | Missing, invalid, or expired JWT token |
| 403 | `FORBIDDEN` | Insufficient role permissions (e.g. Staff performing Owner-only action) |
| 404 | `NOT_FOUND` | Resource (Customer, Transaction, Reminder, Store) not found |
| 409 | `CONFLICT` | Concurrent modification conflict |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests / OTP attempts |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected internal server error |

## Centralized Error Handling Architecture
- Custom `AppError` class extending native `Error` with `statusCode`, `errorCode`, and optional `errors` array.
- Global express error middleware intercepts all unhandled errors, formats the standard response envelope, logs the error with request ID, and prevents process crashes.
