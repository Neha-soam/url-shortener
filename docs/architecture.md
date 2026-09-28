# Architecture

```
Client → Express API → [rate limit → auth → validation] → Controller → Service
                                                                   ├─ ML service (creation only)
                                                                   ├─ MongoDB (source of truth)
                                                                   └─ Redis (redirect cache)
```

## Two separate paths (measure separately)
**Creation `POST /api/urls`:** validate → alias rules → ML classify (once) → insert (unique index, ≤5 retries) → warm Redis → respond.
**Redirect `GET /:shortCode`:** Redis → (miss) MongoDB → populate Redis → record click async → 302.
No ML and no outbound fetches on the redirect path.

## Failure behaviour
| Failure | Behaviour |
|---|---|
| Redis down | cacheService swallows errors → MongoDB lookup; error counter increments |
| ML service down/slow (>1.5s) | link created as `scanStatus: unscanned`; rescanner job classifies later |
| Duplicate short code | Mongo error 11000 → regenerate, max 5 attempts → 503 |
| Duplicate custom alias | 409 |
| Expired link | 404 (checked in code; TTL index deletes later) |
| Deleted link | cache entry deleted on delete |

## Security controls
Scheme allow-list (http/https) · reject credentials in URL · reject localhost/private/reserved IPs · reject self-referencing links · reserved aliases · Helmet · body size limit · rate limits (create 10/min, auth 20/15min, redirect 600/min) · bcrypt(12) · JWT HS256 · ownership checks on delete/analytics · flagged URLs blocked at redirect with warning page · generic 500 errors.
`securityService.safeFetch` (public-IP check on every redirect hop, timeout, size cap) must be used for any feature that fetches user URLs.

## Cache design
Key `url:<shortCode>` → JSON `{id,url,isMalicious,expiresAt}` (JSON rather than a bare URL so the redirect can honour expiry/malicious flags without a DB hit). TTL = min(CACHE_TTL_SECONDS, time-to-expiry).
