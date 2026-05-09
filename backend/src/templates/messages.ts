/**
 * Notif templates — WA + Email pairs.
 * WA = plain text. Email = HTML body.
 *
 * Pakai sebagai: const { wa, email } = templates.orderCreated({ ... })
 */

const SITE = 'https://jualakun.id'

function shell(body: string, footer = 'Terima kasih telah berbelanja di Jualakun.id.'): string {
  return `<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
  <div style="font-weight:700;font-size:20px;color:#111">Jualakun<span style="color:#0089A8">.id</span></div>
  <div style="margin-top:16px;line-height:1.6">${body}</div>
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0"/>
  <div style="font-size:12px;color:#6B7280">${footer} · <a href="${SITE}" style="color:#0089A8">jualakun.id</a></div>
</div>`
}

export const templates = {
  orderCreated: (p: { fullName: string; orderNumber: string; productName: string; totalIdr: number; snapUrl: string }) => ({
    template: 'order_created',
    waText:
      `Halo ${p.fullName},\n\n` +
      `Pesanan *${p.orderNumber}* untuk _${p.productName}_ sudah dibuat.\n` +
      `Total: Rp ${p.totalIdr.toLocaleString('id-ID')}\n\n` +
      `Lanjutkan pembayaran: ${p.snapUrl}\n\n` +
      `Pesanan akan kedaluwarsa dalam 24 jam.`,
    emailSubject: `Pesanan ${p.orderNumber} — Lanjutkan Pembayaran`,
    emailHtml: shell(
      `<p>Halo <strong>${p.fullName}</strong>,</p>
       <p>Pesanan <strong>${p.orderNumber}</strong> untuk <em>${p.productName}</em> sudah dibuat.</p>
       <p>Total: <strong>Rp ${p.totalIdr.toLocaleString('id-ID')}</strong></p>
       <p><a href="${p.snapUrl}" style="display:inline-block;background:#0089A8;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Lanjutkan Pembayaran</a></p>
       <p style="color:#6B7280;font-size:13px">Pesanan akan kedaluwarsa dalam 24 jam.</p>`,
    ),
  }),

  accountDelivered: (p: { fullName: string; orderNumber: string; productName: string; credentials: string; note: string | null; guaranteeExpiresAt: string }) => ({
    template: 'account_delivered',
    waText:
      `Halo ${p.fullName},\n\n` +
      `Pesanan *${p.orderNumber}* sudah aktif. Berikut akses akun Anda:\n\n` +
      `${p.credentials}\n\n` +
      (p.note ? `Catatan: ${p.note}\n\n` : '') +
      `Garansi sampai: ${new Date(p.guaranteeExpiresAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}\n\n` +
      `Cek detail di dashboard Jualakun.id.`,
    emailSubject: `${p.productName} sudah aktif — Jualakun.id`,
    emailHtml: shell(
      `<p>Halo <strong>${p.fullName}</strong>,</p>
       <p>Pesanan <strong>${p.orderNumber}</strong> untuk <em>${p.productName}</em> sudah aktif.</p>
       <pre style="background:#F3F4F6;padding:12px;border-radius:8px;font-family:'JetBrains Mono',monospace;white-space:pre-wrap;word-break:break-all">${p.credentials}</pre>
       ${p.note ? `<p><strong>Catatan:</strong> ${p.note}</p>` : ''}
       <p style="font-size:13px;color:#6B7280">Garansi aktif hingga ${new Date(p.guaranteeExpiresAt).toLocaleDateString('id-ID')}</p>
       <p><a href="${SITE}/dashboard" style="color:#0089A8">Lihat di dashboard →</a></p>`,
    ),
  }),

  ticketReplaced: (p: { fullName: string; orderNumber: string; resolution: string }) => ({
    template: 'ticket_replaced',
    waText:
      `Halo ${p.fullName},\n\n` +
      `Tiket Anda untuk pesanan *${p.orderNumber}* sudah diresolve.\n\n` +
      `${p.resolution}\n\n` +
      `Akun pengganti sudah aktif di dashboard Jualakun.id.`,
    emailSubject: `Tiket pesanan ${p.orderNumber} sudah diresolve`,
    emailHtml: shell(
      `<p>Halo <strong>${p.fullName}</strong>,</p>
       <p>Tiket Anda untuk pesanan <strong>${p.orderNumber}</strong> sudah diresolve.</p>
       <blockquote style="border-left:3px solid #0089A8;padding:8px 12px;margin:16px 0;color:#374151">${p.resolution}</blockquote>
       <p>Akun pengganti sudah dapat diakses di <a href="${SITE}/dashboard" style="color:#0089A8">dashboard</a>.</p>`,
    ),
  }),

  referralCredited: (p: { fullName: string; creditAmount: number; totalCredits: number }) => ({
    template: 'referral_credited',
    waText:
      `Halo ${p.fullName},\n\n` +
      `Selamat! Anda dapat kredit *Rp ${p.creditAmount.toLocaleString('id-ID')}* dari program referral.\n\n` +
      `Saldo kredit total: Rp ${p.totalCredits.toLocaleString('id-ID')}\n\n` +
      `Pakai kredit di checkout berikutnya.`,
    emailSubject: `+Rp ${p.creditAmount.toLocaleString('id-ID')} kredit referral — Jualakun.id`,
    emailHtml: shell(
      `<p>Halo <strong>${p.fullName}</strong>,</p>
       <p>Selamat! Anda mendapatkan kredit <strong>+Rp ${p.creditAmount.toLocaleString('id-ID')}</strong> dari program referral.</p>
       <p>Saldo total: <strong>Rp ${p.totalCredits.toLocaleString('id-ID')}</strong></p>
       <p><a href="${SITE}/dashboard/referral" style="color:#0089A8">Lihat detail referral →</a></p>`,
    ),
  }),

  adminLowStock: (p: { products: { name: string; stock_count: number }[] }) => ({
    template: 'admin_low_stock',
    waText:
      `[ALERT] Stok produk hampir/sudah habis:\n\n` +
      p.products.map((pr) => `- ${pr.name}: ${pr.stock_count} unit`).join('\n') +
      `\n\nLink: ${SITE}/admin/stok-monitor`,
  }),

  adminDeliveryFailed: (p: { orderNumber: string }) => ({
    template: 'admin_delivery_failed',
    waText: `[ALERT] Delivery gagal untuk order ${p.orderNumber}. Cek admin panel: ${SITE}/admin/pesanan?status=delivery_failed`,
  }),
} as const
