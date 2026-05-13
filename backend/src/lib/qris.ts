/**
 * QRIS Statis → Dinamis converter.
 *
 * QRIS payload pakai format TLV (Tag-Length-Value) sesuai EMVCo spec:
 *   - Tag 01 (Point of Initiation Method): "11" = statis, "12" = dinamis
 *   - Tag 54 (Transaction Amount): nilai pembayaran (optional di statis,
 *     WAJIB di dinamis)
 *   - Tag 63 (CRC16-CCITT-FALSE checksum): WAJIB di akhir, harus
 *     di-recalculate kalau payload dimodifikasi
 *
 * Untuk inject amount:
 *   1. Parse payload jadi TLV items
 *   2. Remove CRC lama (tag 63)
 *   3. Ubah tag 01 "11" → "12" (statis → dinamis)
 *   4. Insert/replace tag 54 dengan amount
 *   5. Serialize + recalculate CRC + append
 *
 * Pure TypeScript, no dependency. Compatible dengan Cloudflare Workers.
 */

type TLV = { tag: string; length: number; value: string }

/**
 * Parse QRIS payload string ke list TLV items.
 * Recursive: nested tag (e.g. tag 26 yang berisi sub-TLV) di-treat sebagai
 * single value — kita tidak modify isinya untuk amount injection.
 */
function parseTLV(payload: string): TLV[] {
  const result: TLV[] = []
  let pos = 0
  while (pos < payload.length) {
    if (pos + 4 > payload.length) break
    const tag = payload.slice(pos, pos + 2)
    const length = parseInt(payload.slice(pos + 2, pos + 4), 10)
    if (Number.isNaN(length) || pos + 4 + length > payload.length) break
    const value = payload.slice(pos + 4, pos + 4 + length)
    result.push({ tag, length, value })
    pos += 4 + length
  }
  return result
}

function serializeTLV(items: TLV[]): string {
  return items.map((t) => `${t.tag}${String(t.length).padStart(2, '0')}${t.value}`).join('')
}

/**
 * CRC16-CCITT-FALSE (poly 0x1021, init 0xFFFF, no reflect, no xor-out).
 * Standard QRIS uses this variant per EMVCo spec.
 */
function crc16CcittFalse(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc <<= 1
      }
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Convert QRIS Statis payload ke Dinamis dengan amount injected.
 *
 * @param staticPayload Raw QRIS Statis string (start dengan "00020101021..."
 *                      ada di QRIS Anda dari GoPay Saya, decode dari QR PNG
 *                      pakai online tool atau library)
 * @param amountIdr     Amount dalam Rupiah (integer, e.g. 75123 untuk Rp 75.123)
 * @returns Payload baru — render jadi QR image di frontend pakai library QR
 */
export function injectAmount(staticPayload: string, amountIdr: number): string {
  if (!staticPayload || staticPayload.length < 20) {
    throw new Error('QRIS Statis payload invalid (terlalu pendek atau kosong)')
  }
  if (!Number.isInteger(amountIdr) || amountIdr <= 0) {
    throw new Error('Amount harus integer positif')
  }

  let items = parseTLV(staticPayload)
  if (items.length === 0) {
    throw new Error('QRIS Statis payload tidak bisa di-parse (format invalid)')
  }

  // Hapus CRC lama (tag 63)
  items = items.filter((t) => t.tag !== '63')

  // Ubah tag 01 (Point of Initiation Method) dari "11" (statis) → "12" (dinamis)
  const tag01 = items.find((t) => t.tag === '01')
  if (tag01) {
    tag01.value = '12'
    tag01.length = 2
  }

  // Insert/replace tag 54 (Transaction Amount)
  const amountStr = String(amountIdr)
  const newAmountTLV: TLV = { tag: '54', length: amountStr.length, value: amountStr }
  const amountIdx = items.findIndex((t) => t.tag === '54')
  if (amountIdx >= 0) {
    items[amountIdx] = newAmountTLV
  } else {
    // Insert setelah tag 53 (Transaction Currency) — posisi standard EMV
    const idx53 = items.findIndex((t) => t.tag === '53')
    if (idx53 >= 0) {
      items.splice(idx53 + 1, 0, newAmountTLV)
    } else {
      // Fallback: insert sebelum tag 58 (Country Code) atau di akhir
      const idx58 = items.findIndex((t) => t.tag === '58')
      items.splice(idx58 >= 0 ? idx58 : items.length, 0, newAmountTLV)
    }
  }

  // Serialize, hitung CRC, append
  const serialized = serializeTLV(items)
  const withCrcPlaceholder = serialized + '6304'
  const crc = crc16CcittFalse(withCrcPlaceholder)
  return withCrcPlaceholder + crc
}

/**
 * Generate 3-digit suffix random (0-999). Caller harus retry on collision
 * (pakai unique partial index di DB sebagai final guard).
 */
export function generateUniqueSuffix(): number {
  return Math.floor(Math.random() * 1000)
}

/**
 * Validate QRIS Statis payload basic — pastikan minimal mandatory tags ada
 * + CRC valid. Dipakai saat setup env var supaya admin tau payload bener
 * sebelum jalan production.
 */
export function validateStaticPayload(payload: string): { ok: true } | { ok: false; reason: string } {
  if (!payload) return { ok: false, reason: 'Payload kosong' }
  if (payload.length < 20) return { ok: false, reason: 'Payload terlalu pendek' }

  const items = parseTLV(payload)
  if (items.length === 0) return { ok: false, reason: 'Payload tidak bisa di-parse sebagai TLV' }

  // Mandatory tags per EMVCo: 00 (payload format indicator), 01 (initiation
  // method), 52 (MCC), 53 (currency), 58 (country), 59 (merchant name), 63 (CRC)
  const requiredTags = ['00', '01', '52', '53', '58', '59', '63']
  for (const tag of requiredTags) {
    if (!items.some((t) => t.tag === tag)) {
      return { ok: false, reason: `Tag wajib ${tag} tidak ada di payload` }
    }
  }

  // Tag 01 untuk Statis harus "11" (Dinamis "12" — kalau "12" berarti
  // payload sudah Dinamis, bukan Statis)
  const tag01 = items.find((t) => t.tag === '01')
  if (tag01?.value !== '11') {
    return { ok: false, reason: 'Tag 01 bukan "11" — payload bukan QRIS Statis (mungkin Dinamis)' }
  }

  // Validate CRC: ambil payload tanpa value tag 63, hitung CRC, bandingkan
  const crcMatch = payload.match(/6304([0-9A-F]{4})$/i)
  if (!crcMatch) return { ok: false, reason: 'Tag 63 (CRC) tidak ditemukan di akhir' }
  const expectedCrc = crcMatch[1].toUpperCase()
  const payloadForCrc = payload.slice(0, -4) // exclude 4 hex CRC chars
  const computedCrc = crc16CcittFalse(payloadForCrc)
  if (computedCrc !== expectedCrc) {
    return { ok: false, reason: `CRC mismatch: expected ${expectedCrc}, computed ${computedCrc}` }
  }

  return { ok: true }
}
