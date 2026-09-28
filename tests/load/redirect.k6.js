// k6 load test for the REDIRECT path. Install k6, then:
//   1) create a link:   curl -X POST localhost:4000/api/urls -H 'Content-Type: application/json' -d '{"url":"https://example.com","customAlias":"loadtest"}'
//   2) run:             k6 run tests/load/redirect.k6.js
// Compare results with Redis ON vs OFF (stop the redis container) and report avg / p95 / req/s.
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [{ duration: '10s', target: 50 }, { duration: '30s', target: 200 }, { duration: '10s', target: 0 }],
  thresholds: { http_req_duration: ['p(95)<100'], http_req_failed: ['rate<0.01'] },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL || 'http://localhost:4000'}/${__ENV.CODE || 'loadtest'}`, { redirects: 0 });
  check(res, { 'is 302': (r) => r.status === 302 });
}
// NOTE: the redirect limiter allows 600 req/min/IP by default. For load tests, raise it in
// middleware/rateLimiter.js (or run with NODE_ENV=loadtest and skip it) -- don't leave it off in production.
