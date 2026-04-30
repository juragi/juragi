import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'crypto';

const HASH_KEY_LEN = 64;
const TOKEN_SECRET = process.env.AUTH_SECRET || 'replace-with-a-secure-secret';
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7;

function base64UrlEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  return Buffer.from(padded, 'base64');
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, HASH_KEY_LEN).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  if (!stored) {
    return false;
  }

  const [salt, derivedHash] = stored.split(':');
  if (!salt || !derivedHash) {
    return false;
  }

  const candidate = scryptSync(password, salt, HASH_KEY_LEN).toString('hex');
  return timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(derivedHash, 'hex'));
}

export function createSessionToken(payload) {
  const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = base64UrlEncode(
    Buffer.from(
      JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS,
      })
    )
  );
  const signature = createHmac('sha256', TOKEN_SECRET).update(`${header}.${body}`).digest();
  return `${header}.${body}.${base64UrlEncode(signature)}`;
}

export function verifySessionToken(token) {
  if (!token) {
    return null;
  }

  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) {
    return null;
  }

  const expectedSignature = createHmac('sha256', TOKEN_SECRET).update(`${header}.${body}`).digest();
  const signatureBuffer = base64UrlDecode(signature);

  if (!timingSafeEqual(expectedSignature, signatureBuffer)) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(body).toString('utf8'));
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    return null;
  }

  return payload;
}
