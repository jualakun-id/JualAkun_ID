# Supabase Email Branding — JualAkun

Default Supabase email (verification, reset password, magic link) bersifat **generic** — tidak ada brand JualAkun, dari `noreply@mail.app.supabase.io`. Untuk konsistensi UX & deliverability, override 2 hal di Supabase Dashboard:

1. **Custom SMTP** — Resend (sudah configured untuk transactional email)
2. **Email templates** — branded JualAkun

## Step 1: Set Custom SMTP (Resend)

Login Supabase Dashboard → Project `jualakun` → **Authentication** → **SMTP Settings**.

Toggle **Enable Custom SMTP** ON, isi:

| Field | Value |
|-------|-------|
| Sender email | `noreply@jualakun.id` |
| Sender name | `Jualakun.id` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | `<RESEND_API_KEY>` (sama dengan secret di backend) |

Klik **Save**.

> **Cek di Resend dashboard**: pastikan domain `jualakun.id` status **Verified** (sudah ✅ — done 2026-05-10).

## Step 2: Branded Email Templates

Pindah ke **Authentication** → **Email Templates**. Ada 5 template default:

1. **Confirm signup** (email verification setelah register)
2. **Reset password**
3. **Magic link** (passwordless login)
4. **Change email address**
5. **Invite user** (untuk admin invite)

Untuk JualAkun, yang penting: **#1 (Confirm signup) + #2 (Reset password)**. Magic link & invite tidak dipakai.

### Template: Confirm Signup

Subject: `Konfirmasi email Anda di Jualakun.id`

Body (HTML):

```html
<div style="font-family:Inter,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
  <div style="font-weight:700;font-size:20px;color:#111">Jualakun<span style="color:#1296A8">.id</span></div>
  <div style="margin-top:16px;line-height:1.6">
    <p>Halo,</p>
    <p>Terima kasih sudah daftar di <strong>Jualakun.id</strong> — marketplace akun digital premium #1 Indonesia.</p>
    <p>Klik tombol di bawah untuk konfirmasi email Anda:</p>
    <p style="margin:24px 0">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#1296A8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Konfirmasi Email</a>
    </p>
    <p style="color:#6B7280;font-size:13px">Atau buka link ini: <br/>{{ .ConfirmationURL }}</p>
    <p style="color:#6B7280;font-size:13px">Link berlaku 24 jam. Kalau Anda tidak daftar di Jualakun.id, abaikan email ini.</p>
  </div>
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0"/>
  <div style="font-size:12px;color:#6B7280">Jualakun.id — Anti Mainstream, Tetap Asli · <a href="https://jualakun.id" style="color:#1296A8">jualakun.id</a></div>
</div>
```

### Template: Reset Password

Subject: `Reset password akun Jualakun.id Anda`

Body (HTML):

```html
<div style="font-family:Inter,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
  <div style="font-weight:700;font-size:20px;color:#111">Jualakun<span style="color:#1296A8">.id</span></div>
  <div style="margin-top:16px;line-height:1.6">
    <p>Halo,</p>
    <p>Kami menerima permintaan reset password untuk akun Anda. Klik tombol di bawah untuk membuat password baru:</p>
    <p style="margin:24px 0">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#1296A8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
    </p>
    <p style="color:#6B7280;font-size:13px">Atau buka link ini: <br/>{{ .ConfirmationURL }}</p>
    <p style="color:#6B7280;font-size:13px">Link berlaku 1 jam. Kalau Anda tidak request reset, abaikan email ini — password lama tetap aktif.</p>
  </div>
  <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0"/>
  <div style="font-size:12px;color:#6B7280">Butuh bantuan? Balas email ini · <a href="https://jualakun.id" style="color:#1296A8">jualakun.id</a></div>
</div>
```

## Step 3: Test

1. Logout dari akun test → klik **Lupa password** di login page
2. Cek inbox — email harus:
   - ✅ From: `noreply@jualakun.id` (bukan `noreply@mail.app.supabase.io`)
   - ✅ Subject: `Reset password akun Jualakun.id Anda`
   - ✅ Branded sesuai template di atas

3. Daftar akun baru dengan email lain → cek email verifikasi pakai template branded juga.

## Variables Supabase yang bisa dipakai

Di email template, variable interpolation pakai `{{ .Variable }}`:

| Variable | Konteks |
|----------|---------|
| `{{ .ConfirmationURL }}` | Link konfirmasi (signup/reset/magic) |
| `{{ .Email }}` | Email user |
| `{{ .Token }}` | OTP code (kalau pakai OTP flow) |
| `{{ .TokenHash }}` | Hashed token |
| `{{ .SiteURL }}` | URL site (https://jualakun.id) |
| `{{ .Data.full_name }}` | Custom user metadata (saat register) |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Email tetap dari `@mail.app.supabase.io` | Toggle Custom SMTP OFF/ON lagi, save lagi. Cek logs auth Supabase |
| 535 Authentication failed | RESEND_API_KEY salah atau Resend account suspended. Cek API Keys page di Resend |
| Email masuk Spam | Pastikan DKIM + SPF + DMARC sudah verified di Resend (already done) |
| Variable `{{ .Data.full_name }}` kosong | User register tidak include `full_name` di metadata — tidak relevan, kita pakai branded body generic |

## Rate Limit

Resend free tier: **100 email/hari**, **3000/bulan**. Kalau JualAkun grow > 100 register/day, upgrade ke Resend paid plan ($20/mo = 50k email/bulan).

Sementara untuk awal launch, free tier sudah cukup (100 email/day = 100 register baru per hari, biasanya jauh dari batas itu di fase awal).
