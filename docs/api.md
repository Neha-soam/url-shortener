# API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /api/urls | optional | Create short URL |
| GET | /api/urls | required | List my URLs |
| DELETE | /api/urls/:id | required | Delete my URL (also clears cache) |
| GET | /api/urls/:id/analytics?days=30 | required (owner) | Analytics |
| POST | /api/auth/register | – | `{email, password(min 8)}` → `{token}` |
| POST | /api/auth/login | – | → `{token}` |
| GET | /:shortCode | – | 302 redirect (403 warning page if flagged, 404 if missing/expired) |
| GET | /health | – | status + cache hit/miss stats |

## POST /api/urls
Request: `{ "url": "https://...", "customAlias": "my-link", "expiresInDays": 7 }` (last two optional)
Response 201:
```json
{ "id": "...", "shortCode": "aB3dE9x", "shortUrl": "http://localhost:4000/aB3dE9x",
  "originalUrl": "https://...",
  "classification": { "scanStatus": "scanned", "isMalicious": false, "riskScore": 0.03, "modelVersion": "v1.0", "explanation": [] },
  "clicks": 0, "expiresAt": null }
```
Errors: 400 invalid input · 409 alias taken · 429 rate limited · 503 could not allocate code.

## Testing expiry (manual)
Create a link with `expiresInDays: 1`, then in mongosh:
`db.urls.updateOne({shortCode:"<code>"},{$set:{expiresAt:new Date(Date.now()-1000)}})` and `redis-cli DEL url:<code>` → GET returns 404.
