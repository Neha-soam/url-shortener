import React from 'react';

// Distinct from RiskBadge: this is "does the destination actually respond"
// (live HTTP check), not "is this a phishing link" (ML classification).
// A link can be perfectly safe and still be unreachable (site is down,
// page was deleted) -- the two signals are independent, so they get their
// own badge rather than being folded into one.
// Codes like 401/403/429 very commonly mean "a bot-detection system blocked
// OUR automated check," not "the page is actually broken" -- sites such as
// Codeforces or anything behind Cloudflare routinely do this to real, live
// pages. Only treat codes that mean "this specific page is gone" as broken.
const CONFIDENTLY_BROKEN = new Set([404, 410]);
const isServerError = (code) => code >= 500;

export default function ReachabilityBadge({ reachability }) {
  if (!reachability || reachability.status === 'unknown') {
    return <span className="badge neutral">Reachability unknown</span>;
  }
  const { httpStatus } = reachability;

  if (CONFIDENTLY_BROKEN.has(httpStatus) || isServerError(httpStatus)) {
    return <span className="badge risk">Page not found ({httpStatus})</span>;
  }
  if (httpStatus >= 400) {
    // 401/403/429 etc: IMPORTANT -- this does NOT mean the page exists.
    // Bot-blocking WAFs (Cloudflare, Codeforces, etc.) return the exact same
    // 403 for a real page AND a completely made-up one, because they block
    // at the edge before even checking if the content exists. A 403 here
    // carries no evidence either way -- treat it as genuinely unknown, not
    // as reassurance, and verify in an actual browser if it matters.
    return <span className="badge neutral">Could not verify &mdash; site blocked the check ({httpStatus})</span>;
  }
  return <span className="badge safe">Reachable ({httpStatus})</span>;
}
