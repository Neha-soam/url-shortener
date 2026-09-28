// Aliases that would collide with API routes / app pages.
const RESERVED = new Set([
  'api', 'admin', 'login', 'logout', 'register', 'signup', 'health', 'static',
  'assets', 'dashboard', 'analytics', 'auth', 'favicon.ico', 'robots.txt', 'null', 'undefined',
]);

const isReserved = (alias) => RESERVED.has(String(alias).toLowerCase());

module.exports = { RESERVED, isReserved };
