// Response shape verified against backend/src/services/analyticsService.js:
// { rangeDays, totalClicks, clicksOverTime, referrers, devices, browsers }
import { apiFetch } from './http.js';

export async function getAnalytics(urlId, days = 30) {
  return apiFetch(`/urls/${urlId}/analytics?days=${days}`);
}
