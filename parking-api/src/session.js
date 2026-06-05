const crypto = require('crypto')

const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 8 * 60 * 60 * 1000)
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET o SUPABASE_SERVICE_ROLE_KEY requerido para firmar sesiones')
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function decode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
}

function sign(payload) {
  return crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url')
}

function createSession(user) {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const payload = encode({
    sub: user.id,
    rol: user.rol,
    exp: expiresAt,
  })
  return {
    token: `${payload}.${sign(payload)}`,
    expires_at: new Date(expiresAt).toISOString(),
  }
}

function verifySession(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token de sesión requerido')
  }

  const [payload, signature] = token.split('.')
  if (!payload || !signature || signature !== sign(payload)) {
    throw new Error('Token de sesión inválido')
  }

  const session = decode(payload)
  if (!session.sub || !session.exp || Date.now() >= session.exp) {
    throw new Error('Sesión expirada')
  }

  return session
}

module.exports = { createSession, verifySession }
