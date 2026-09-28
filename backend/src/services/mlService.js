const env = require('../config/env');

/**
 * Calls the Python ML service ONCE at URL-creation time.
 * If the service is down/slow we fail OPEN (link is created, marked "unscanned")
 * so the shortener still works; the background rescanner can classify it later.
 */
async function classifyUrl(url) {
  try {
    const res = await fetch(`${env.ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(env.ML_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`ML service responded ${res.status}`);
    const data = await res.json();
    return {
      scanStatus: 'scanned',
      isMalicious: Boolean(data.isMalicious),
      riskScore: data.riskScore,
      modelVersion: data.modelVersion,
      explanation: data.explanation || [],
    };
  } catch (err) {
    console.error('[ml] classification failed:', err.message);
    return { scanStatus: 'unscanned', isMalicious: false, riskScore: null, modelVersion: null, explanation: [] };
  }
}

module.exports = { classifyUrl };
