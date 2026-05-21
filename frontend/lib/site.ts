/**
 * Konstanta kontak situs — dipakai footer, halaman kontak, floating chat.
 * Single source of truth: ganti nomor di SINI saja kalau berubah.
 */

/** Nomor WhatsApp support customer. Format E.164 tanpa tanda '+'. */
export const WHATSAPP_SUPPORT_NUMBER = '6287868476580'

/** Versi tampil untuk teks UI. */
export const WHATSAPP_SUPPORT_DISPLAY = '+62 878-6847-6580'

/**
 * Bangun URL wa.me. `message` opsional untuk pre-fill teks chat.
 */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
