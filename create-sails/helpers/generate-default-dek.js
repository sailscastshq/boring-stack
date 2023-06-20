import crypto from 'crypto'

export function generateDefaultDEK() {
  return crypto.randomBytes(32).toString('base64')
}
