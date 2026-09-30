// Mock data for frontend-first development (CLAUDE.md section 28).
// Structurally mirrors the real API response documented in docs/api.md --
// do not add fields here that the backend doesn't actually return.

export const mockUser = { id: 'mock-user-1', email: 'demo@example.com' };

export const mockUrls = [
  {
    id: 'mock-1',
    shortCode: 'aB3dE9x',
    shortUrl: 'http://localhost:4000/aB3dE9x',
    originalUrl: 'https://example.com/very/long/path/to/something',
    classification: { scanStatus: 'scanned', isMalicious: false, riskScore: 0.03, modelVersion: 'v1.0', explanation: [] },
    clicks: 42,
    expiresAt: null,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'mock-2',
    shortCode: 'x7k2q9',
    shortUrl: 'http://localhost:4000/x7k2q9',
    originalUrl: 'http://secure-login-paypal.x7k2q9.xyz/verify?session=abc123',
    classification: {
      scanStatus: 'scanned', isMalicious: true, riskScore: 0.92, modelVersion: 'v1.0',
      explanation: ['Contains phishing-style keywords', 'Suspicious top-level domain', 'Unusually long hostname'],
    },
    clicks: 3,
    expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const mockAnalytics = (urlId) => ({
  rangeDays: 30,
  totalClicks: urlId === 'mock-2' ? 3 : 42,
  clicksOverTime: [
    { date: '2026-09-24', count: 5 },
    { date: '2026-09-25', count: 8 },
    { date: '2026-09-26', count: 12 },
    { date: '2026-09-27', count: 6 },
    { date: '2026-09-28', count: 11 },
  ],
  referrers: [{ label: 'direct', count: 20 }, { label: 'twitter.com', count: 15 }],
  devices: [{ label: 'mobile', count: 25 }, { label: 'desktop', count: 17 }],
  browsers: [{ label: 'Chrome', count: 30 }, { label: 'Safari', count: 12 }],
});
