/**
 * AES-256-GCM encryption for credential storage in account_stock.credentials_enc.
 * Format on disk: base64(iv || ciphertext || authTag)
 *
 * ENCRYPTION_KEY must be a 32-byte hex string (64 chars). Generate via:
 *   openssl rand -hex 32
 */

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex key length')
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function importKey(): Promise<CryptoKey> {
  const raw = process.env.ENCRYPTION_KEY!
  const keyBytes = raw.length === 64 ? hexToBytes(raw) : new TextEncoder().encode(raw).slice(0, 32)
  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

export class CryptoService {
  static async encrypt(plaintext: string): Promise<string> {
    const key = await importKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const data = new TextEncoder().encode(plaintext)
    const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data))

    const combined = new Uint8Array(iv.length + cipher.length)
    combined.set(iv, 0)
    combined.set(cipher, iv.length)
    return toBase64(combined)
  }

  static async decrypt(encoded: string): Promise<string> {
    const key = await importKey()
    const combined = fromBase64(encoded)
    const iv = combined.slice(0, 12)
    const cipher = combined.slice(12)
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher)
    return new TextDecoder().decode(plain)
  }
}
