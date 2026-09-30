import { mockUrls } from './mockData.js';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
let store = [...mockUrls];

export async function shorten({ url, customAlias }) {
  await delay();
  if (store.some((u) => u.shortCode === customAlias)) {
    throw Object.assign(new Error('Alias already in use'), { status: 409 });
  }
  const doc = {
    id: `mock-${Date.now()}`,
    shortCode: customAlias || Math.random().toString(36).slice(2, 9),
    shortUrl: `http://localhost:4000/${customAlias || 'xxxxxxx'}`,
    originalUrl: url,
    classification: { scanStatus: 'scanned', isMalicious: false, riskScore: 0.05, modelVersion: 'v1.0-mock', explanation: [] },
    clicks: 0,
    expiresAt: null,
    createdAt: new Date().toISOString(),
  };
  store = [doc, ...store];
  return doc;
}

export async function myUrls() {
  await delay();
  return store;
}

export async function removeUrl(id) {
  await delay();
  store = store.filter((u) => u.id !== id);
  return null;
}
