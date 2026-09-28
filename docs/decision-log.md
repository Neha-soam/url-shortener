# Decision log
| # | Decision | Reason |
|---|---|---|
| 1 | ML runs once at creation, result stored | keeps redirect latency low, result auditable (model version) |
| 2 | Redis fail-open to MongoDB | cache is an optimisation, not a single point of failure |
| 3 | DB unique index + bounded retry | app-level uniqueness checks race under concurrency |
| 4 | 302 (not 301) redirects | 301s get cached by browsers → clicks not counted, expiry ignored |
| 5 | Cache stores JSON, not bare URL | needs expiry + malicious flag on the hot path |
| 6 | ML failure = fail open + `unscanned` + rescanner | availability over strictness; revisit if abuse appears |
| 7 | No IP/geo in analytics | data minimisation; add only with documented need |
| 8 | Semantic slugs deferred | requires server-side fetching → SSRF surface; not MVP |
| 9 | `server.js` separate from `app.js` | app can be imported by tests without opening a port |
| 10 | Model chosen on validation set; test set touched once | avoids optimistic bias |
