const crypto = require('crypto');

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const ALIAS_REGEX = /^[A-Za-z0-9_-]{3,30}$/;

// crypto.randomInt is uniform & unpredictable (unlike Math.random)
function generateCode(length = 7) {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return out;
}

const isValidAlias = (alias) => typeof alias === 'string' && ALIAS_REGEX.test(alias);

module.exports = { generateCode, isValidAlias, ALPHABET };
