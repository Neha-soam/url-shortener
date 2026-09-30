import { mockAnalytics } from './mockData.js';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getAnalytics(urlId) {
  await delay();
  return mockAnalytics(urlId);
}
