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
| 11 | No `users` document until OTP is verified (held in `pendingregistrations` instead) | an unverified email never becomes a real, loggable-in account; abandoned signups self-expire via TTL index, no cleanup job needed |
| 12 | Reachability check reuses `securityService.safeFetch` (HEAD, SSRF-protected) rather than a separate fetch path | one SSRF-safe fetch implementation instead of two to keep in sync |
| 13 | Reachability and ML classification run concurrently (`Promise.all`), not sequentially | both are independent I/O calls with their own timeout; halves the added latency for roughly the same code |
| 14 | A 4xx/5xx HTTP response still counts as `reachable` (status + real code both stored) | "the server didn't respond at all" and "the server responded with a 404" are different problems; collapsing them loses information |
| 15 | Reachability HEAD requests send a real browser User-Agent; the frontend treats 401/403/429 as neutral ("blocked our check"), not broken, while only 404/410/5xx show as broken | sites like Codeforces / anything behind Cloudflare return 403 to ANY request that doesn't look like a browser, even for perfectly live pages -- without this, the badge falsely accused working links of being dead |
