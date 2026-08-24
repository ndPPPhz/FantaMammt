const crypto = require('crypto');

const KEY_LENGTH = 64;

// Stored as "saltHex:hashHex". No extra dependency (no native module to
// compile) since crypto.scrypt is built into Node itself.
function hashPin(plainPin) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(plainPin), salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPin(plainPin, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const candidate = crypto.scryptSync(String(plainPin), salt, KEY_LENGTH);
  const expected = Buffer.from(hash, 'hex');
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

module.exports = { hashPin, verifyPin };
