import { apiFetch } from './http.js';
import * as mock from './mock/analyticsService.mock.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function realGetAnalytics(urlId, days = 30) {
  return apiFetch(`/urls/${urlId}/analytics?days=${days}`);
}

export const getAnalytics = USE_MOCK ? mock.getAnalytics : realGetAnalytics;
