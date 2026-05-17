/**
 * Notif templates — WA + Email pairs.
 * WA = plain text. Email = HTML body.
 *
 * Pakai sebagai: const { wa, email } = templates.orderCreated({ ... })
 */

const SITE = 'https://jualakun.id'

function shell(body: string, footer = 'Terima kasih telah berbelanja di Jualakun.id.'): string {
  return `<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
  <div style="font-weight:700;font-size:20px;color:#111">Jualakun<span style="color:#1296A8">.id</span></div>
  <div style="margin-top:16px;line-height:1.6">${body}</div>
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0"/>
  <div style="font-size:12px;color:#6B7280">${footer} · <a href="${SITE}" style="color:#1296A8">jualakun.id</a></div>
</div>`
}

export const templates = {
  orderCreated: (p: { fullName: string; orderNumber: string; productName: string; totalIdr: number; orderDetailUrl: string }) => ({
    template: 'order_created',
    waText:
      `Halo ${p.fullName},\n\n` +
      `Pesanan *${p.orderNumber}* untuk _${p.productName}_ sudah dibuat.\n` +
      `Total: Rp ${p.totalIdr.toLocaleString('id-ID')}\n\n` +
      `Lanjutkan pembayaran: ${p.orderDetailUrl}\n\n` +
      `Pesanan akan kedaluwarsa dalam 24 jam.`,
    emailSubject: `Pesanan ${p.orderNumber} — Lanjutkan Pembayaran`,
    emailHtml: shell(
      `<p>Halo <strong>${p.fullName}</strong>,</p>
       <p>Pesanan <strong>${p.orderNumber}</strong> untuk <em>${p.productName}</em> sudah dibuat.</p>
       <p>Total: <strong>Rp ${p.totalIdr.toLocaleString('id-ID')}</strong></p>
       <p><a href="${p.orderDetailUrl}" style="display:inline-block;background:#1296A8;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Lanjutkan Pembayaran</a></p>
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
       <p><a href="${SITE}/dashboard" style="color:#1296A8">Lihat di dashboard →</a></p>`,
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
       <blockquote style="border-left:3px solid #1296A8;padding:8px 12px;margin:16px 0;color:#374151">${p.resolution}</blockquote>
       <p>Akun pengganti sudah dapat diakses di <a href="${SITE}/dashboard" style="color:#1296A8">dashboard</a>.</p>`,
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
       <p><a href="${SITE}/dashboard/referral" style="color:#1296A8">Lihat detail referral →</a></p>`,
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

  paymentReceived: (p: { fullName: string; orderNumber: string; productName: string; totalIdr: number }) => ({
    template: 'payment_received',
    waText:
      `Halo ${p.fullName},\n\n` +
      `Pembayaran untuk pesanan *${p.orderNumber}* (_${p.productName}_) berhasil diterima.\n` +
      `Total: Rp ${p.totalIdr.toLocaleString('id-ID')}\n\n` +
      `Pesanan sedang diproses oleh admin. Akun akan dikirim secepatnya via email & WhatsApp.\n\n` +
      `Cek status di dashboard: ${SITE}/dashboard`,
    emailSubject: `Pembayaran diterima — Pesanan ${p.orderNumber} sedang diproses`,
    emailHtml: shell(
      `<p>Halo <strong>${p.fullName}</strong>,</p>
       <p>Pembayaran untuk pesanan <strong>${p.orderNumber}</strong> (<em>${p.productName}</em>) berhasil diterima.</p>
       <p>Total: <strong>Rp ${p.totalIdr.toLocaleString('id-ID')}</strong></p>
       <p>Pesanan sedang diproses oleh admin. Akun akan dikirim secepatnya via email & WhatsApp.</p>
       <p><a href="${SITE}/dashboard" style="color:#1296A8">Cek status pesanan →</a></p>`,
    ),
  }),

  adminPendingFulfillment: (p: { orderNumber: string; productName: string }) => ({
    template: 'admin_pending_fulfillment',
    waText:
      `[FULFILL] Pesanan *${p.orderNumber}* untuk _${p.productName}_ baru di-bayar — perlu di-fulfill.\n\n` +
      `Buka admin: ${SITE}/admin/pesanan?status=paid`,
  }),

  paymentRejected: (p: { fullName: string; orderNumber: string; amount: number; reason: string }) => ({
    template: 'payment_rejected',
    waText:
      `Halo ${p.fullName},\n\n` +
      `Mohon maaf, pembayaran untuk pesanan *${p.orderNumber}* (Rp ${p.amount.toLocaleString('id-ID')}) tidak bisa diverifikasi.\n\n` +
      `Alasan: ${p.reason}\n\n` +
      `Kalau Anda sudah transfer, mohon kontak admin via dashboard untuk klarifikasi. Atau silakan order ulang di ${SITE}.`,
    emailSubject: `Pembayaran ${p.orderNumber} tidak terverifikasi — Jualakun.id`,
    emailHtml: shell(
      `<p>Halo <strong>${p.fullName}</strong>,</p>
       <p>Mohon maaf, pembayaran untuk pesanan <strong>${p.orderNumber}</strong> sebesar <strong>Rp ${p.amount.toLocaleString('id-ID')}</strong> tidak bisa diverifikasi.</p>
       <p><strong>Alasan:</strong> ${p.reason}</p>
       <p>Kalau Anda sudah transfer namun pesanan ini di-cancel, kemungkinan:</p>
       <ul style="padding-left:20px;color:#374151;line-height:1.8">
         <li>Amount transfer tidak sesuai (harus persis termasuk angka unik di belakang)</li>
         <li>Transfer ke rekening berbeda</li>
         <li>Bukti belum masuk saat admin verifikasi</li>
       </ul>
       <p>Kontak admin via dashboard untuk klarifikasi atau silakan <a href="${SITE}" style="color:#1296A8">order ulang</a>.</p>`,
    ),
  }),

  orderExpired: (p: { fullName: string; orderNumber: string; productName: string }) => ({
    template: 'order_expired',
    waText:
      `Halo ${p.fullName},\n\n` +
      `Pesanan *${p.orderNumber}* untuk _${p.productName}_ otomatis dibatalkan karena pembayaran tidak diselesaikan dalam 24 jam.\n\n` +
      `Stok masih tersedia. Mau pesan ulang? Klik di sini: ${SITE}\n\n` +
      `Kalau ada kendala, hubungi admin di dashboard.`,
    emailSubject: `Pesanan ${p.orderNumber} kedaluwarsa — Pesan Ulang`,
    emailHtml: shell(
      `<p>Halo <strong>${p.fullName}</strong>,</p>
       <p>Pesanan <strong>${p.orderNumber}</strong> untuk <em>${p.productName}</em> otomatis dibatalkan karena pembayaran tidak diselesaikan dalam 24 jam.</p>
       <p>Stok masih tersedia. Mau pesan ulang?</p>
       <p><a href="${SITE}" style="display:inline-block;background:#1296A8;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Pesan Ulang</a></p>
       <p style="color:#6B7280;font-size:13px">Kalau ada kendala, hubungi admin di <a href="${SITE}/dashboard" style="color:#1296A8">dashboard</a>.</p>`,
    ),
  }),

  adminTicketCreated: (p: { orderNumber: string; reason: string; description: string | null }) => ({
    template: 'admin_ticket_created',
    waText:
      `Tiket garansi baru untuk pesanan *${p.orderNumber}*:\n\n` +
      `Alasan: ${p.reason}\n` +
      (p.description ? `Detail: ${p.description.slice(0, 200)}\n\n` : '\n') +
      `Respon dalam 1x24 jam: ${SITE}/admin/tiket`,
  }),

  welcome: (p: { fullName: string; email: string }) => ({
    template: 'welcome',
    emailSubject: `Selamat datang di Jualakun.id, ${p.fullName}!`,
    emailHtml: shell(
      `<p>Halo <strong>${p.fullName}</strong>,</p>
       <p>Selamat datang di <strong>Jualakun.id</strong> — marketplace akun digital premium #1 di Indonesia.</p>
       <p style="margin:16px 0">Yang bisa Anda lakukan sekarang:</p>
       <ol style="padding-left:20px;color:#374151;line-height:1.8">
         <li>Browse 50+ akun premium (AI tools, streaming, creator software)</li>
         <li>Garansi minimal 7 hari setiap produk</li>
         <li>Pembayaran instan via QRIS, VA, e-wallet</li>
         <li>Ajak teman — dapat kredit Rp 5.000 setiap referee transaksi pertama</li>
       </ol>
       <p style="margin:24px 0"><a href="${SITE}" style="display:inline-block;background:#1296A8;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Mulai Belanja</a></p>
       <p style="color:#6B7280;font-size:13px">Email login Anda: <code style="background:#F3F4F6;padding:2px 6px;border-radius:4px">${p.email}</code></p>`,
      'Butuh bantuan? Balas email ini atau chat admin di dashboard.',
    ),
  }),

  guaranteeExpiringSoon: (p: { fullName: string; orderNumber: string; productName: string; daysLeft: number; expiresAt: string }) => ({
    template: 'guarantee_expiring_soon',
    waText:
      `Halo ${p.fullName},\n\n` +
      `Garansi pesanan *${p.orderNumber}* (_${p.productName}_) akan habis dalam *${p.daysLeft} hari* (${new Date(p.expiresAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}).\n\n` +
      `Kalau akun bermasalah, klaim garansi sekarang sebelum kedaluwarsa:\n${SITE}/dashboard\n\n` +
      `Pengingat ini dikirim otomatis 3 hari sebelum garansi habis.`,
    emailSubject: `Garansi ${p.productName} akan habis dalam ${p.daysLeft} hari`,
    emailHtml: shell(
      `<p>Halo <strong>${p.fullName}</strong>,</p>
       <p>Garansi pesanan <strong>${p.orderNumber}</strong> untuk <em>${p.productName}</em> akan habis dalam <strong>${p.daysLeft} hari</strong> (${new Date(p.expiresAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}).</p>
       <p>Kalau akun bermasalah, klaim garansi sekarang sebelum kedaluwarsa.</p>
       <p><a href="${SITE}/dashboard" style="display:inline-block;background:#1296A8;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">Klaim Garansi</a></p>
       <p style="color:#6B7280;font-size:13px">Pengingat ini dikirim otomatis 3 hari sebelum garansi habis.</p>`,
    ),
  }),

  reviewReminder: (p: { fullName: string; orderNumber: string; productName: string; productSlug: string }) => ({
    template: 'review_reminder',
    waText:
      `Halo ${p.fullName},\n\n` +
      `Sudah 3 hari sejak pesanan *${p.orderNumber}* dikirim. Bagaimana pengalamannya dengan _${p.productName}_?\n\n` +
      `Bantu pembeli lain dengan kasih review (5 detik aja):\n${SITE}/produk/${p.productSlug}\n\n` +
      `Terima kasih sudah belanja di Jualakun.id!`,
    emailSubject: `Bagaimana pengalaman Anda dengan ${p.productName}?`,
    emailHtml: shell(
      `<p>Halo <strong>${p.fullName}</strong>,</p>
       <p>Sudah 3 hari sejak pesanan <strong>${p.orderNumber}</strong> untuk <em>${p.productName}</em> dikirim.</p>
       <p>Bagaimana pengalamannya? Bantu pembeli lain dengan kasih review (5 detik aja!):</p>
       <p><a href="${SITE}/produk/${p.productSlug}" style="display:inline-block;background:#1296A8;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">⭐ Kasih Review</a></p>
       <p style="color:#6B7280;font-size:13px">Review jujur Anda sangat membantu komunitas Jualakun.id.</p>`,
    ),
  }),

  adminSupplierLowBalance: (p: { balanceUsd: number; thresholdUsd: number; estimatedOrdersLeft: number }) => ({
    template: 'admin_supplier_low_balance',
    waText:
      `[SUPPLIER] Saldo Canboso hampir habis: *$${p.balanceUsd.toFixed(2)}* (threshold $${p.thresholdUsd.toFixed(2)}).\n\n` +
      `Perkiraan order tersisa: ${p.estimatedOrdersLeft}\n\n` +
      `Top-up segera supaya delivery tidak terganggu:\n${SITE}/admin/stok-monitor`,
  }),
} as const
