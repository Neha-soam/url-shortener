# API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /api/urls | optional | Create short URL |
| GET | /api/urls | required | List my URLs |
| DELETE | /api/urls/:id | required | Delete my URL (also clears cache) |
| GET | /api/urls/:id/analytics?days=30 | required (owner) | Analytics |
| POST | /api/auth/register/start | – | `{email, password(min 8)}` → sends a 6-digit OTP email, `202 {message, expiresInMinutes}`. No account created yet. |
| POST | /api/auth/register/verify | – | `{email, otp}` → creates the account, `201 {token, user}` |
| POST | /api/auth/login | – | `{email, password}` → `{token, user}` |
| GET | /:shortCode | – | 302 redirect (403 warning page if flagged, 404 if missing/expired) |
| GET | /health | – | status + cache hit/miss stats |

## POST /api/urls
Request: `{ "url": "https://...", "customAlias": "my-link", "expiresInDays": 7 }` (last two optional)
Response 201:
```json
{ "id": "...", "shortCode": "aB3dE9x", "shortUrl": "http://localhost:4000/aB3dE9x",
  "originalUrl": "https://...",
  "classification": { "scanStatus": "scanned", "isMalicious": false, "riskScore": 0.03, "modelVersion": "v1.0", "explanation": [] },
  "reachability": { "status": "reachable", "httpStatus": 200 },
  "clicks": 0, "expiresAt": null }
```
`reachability.status` is `"reachable"` (destination answered with *any* HTTP status, including 404/500 -- that still proves a server exists) or `"unknown"` (timeout/DNS failure/couldn't tell). This is a live check, separate from the ML phishing classification, and never blocks creation -- see `securityService.checkReachability`.

Errors: 400 invalid input · 409 alias taken · 429 rate limited · 503 could not allocate code.

## Two-step email verification (registration)
```
POST /api/auth/register/start  {email, password}
  -> 202 {message, expiresInMinutes}   (sends a 6-digit OTP by email; no account yet)
  -> 409 if email already registered
  -> 429 if requested again within OTP_RESEND_COOLDOWN_SECONDS

POST /api/auth/register/verify {email, otp}
  -> 201 {token, user}                 (creates the account, logs in)
  -> 401 incorrect/expired code (each wrong guess counts toward OTP_MAX_ATTEMPTS)
  -> 429 too many incorrect attempts -- client must call /start again for a fresh code
```
Requires `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` configured in `backend/.env` (Gmail App Password or SendGrid SMTP relay both work -- see `.env.example` for exact values). Without these set, `/register/start` will fail -- see `emailService.js`.

## Testing expiry (manual)
Create a link with `expiresInDays: 1`, then in mongosh:
`db.urls.updateOne({shortCode:"<code>"},{$set:{expiresAt:new Date(Date.now()-1000)}})` and `redis-cli DEL url:<code>` → GET returns 404.
