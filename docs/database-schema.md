# Database schema

## urls
`originalUrl, shortCode (UNIQUE), owner→users, isMalicious, riskScore, scanStatus, modelVersion, explanation[], reachability{status, httpStatus, checkedAt}, expiresAt (TTL index), clicks, createdAt, updatedAt`

`reachability.status` is `'reachable'` or `'unknown'` -- a live HTTP check done once at creation (concurrently with the ML scan), separate from phishing classification. See `docs/api.md`.

## users
`email (UNIQUE), passwordHash, timestamps`

## pendingregistrations
`email (UNIQUE), passwordHash, otpHash, attempts, lastSentAt, expiresAt (TTL index)`

Holds a signup between "OTP email sent" and "code verified". No `users` document is created until verification succeeds, so an abandoned/expired signup never leaves a dead account -- the TTL index removes the pending record automatically.

## clicks
`urlId (indexed), timestamp (TTL = CLICK_RETENTION_DAYS), referrer (hostname only), deviceType, browser`

## Privacy / retention (required by the project brief)
| Data | Why | Retention | Anonymised? |
|---|---|---|---|
| Click timestamp | trends over time | 90 days (TTL index) | n/a |
| Referrer **hostname** | traffic sources | 90 days | full URL dropped |
| Device type + browser family | audience insight | 90 days | raw user-agent dropped |
| IP address | **not collected** | – | – |
| Geolocation | **not collected** (add only with a documented need) | – | – |
