# Database schema

## urls
`originalUrl, shortCode (UNIQUE), owner→users, isMalicious, riskScore, scanStatus, modelVersion, explanation[], expiresAt (TTL index), clicks, createdAt, updatedAt`

## users
`email (UNIQUE), passwordHash, timestamps`

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
