'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Edit3, Save, X, Loader2, Copy, Check, KeyRound } from 'lucide-react'
import { useToast } from '@/components/toast'
import { api } from '@/lib/api'

type Props = {
  orderId: string
  orderStatus: string
  hasAccountStock: boolean
}

type CredentialsResponse = {
  credentials_text: string
  note: string | null
  delivered_at: string | null
  account_stock_id: string
}

/**
 * Admin credentials panel — collapsed by default (hide sensitive data),
 * expand untuk lihat, klik Edit untuk update credentials yang sudah
 * dikirim ke buyer. Auto-trigger re-send notif WA + email kalau di-edit.
 *
 * Berbeda dengan ticket flow (yang harus dari buyer): admin bisa fix
 * credentials yang salah dari awal tanpa nunggu buyer komplain.
 */
export function CredentialsPanel({ orderId, orderStatus, hasAccountStock }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [expanded, setExpanded] = useState(false)
  const [creds, setCreds] = useState<CredentialsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [draftNote, setDraftNote] = useState('')
  const [resendNotif, setResendNotif] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Cuma boleh lihat/edit untuk order yang sudah fulfilled
  const canAccess = ['delivered', 'confirmed'].includes(orderStatus) && hasAccountStock

  if (!canAccess) return null

  async function handleExpand() {
    if (expanded) {
      setExpanded(false)
      return
    }
    if (creds) {
      setExpanded(true)
      return
    }
    setLoading(true)
    const result = await api.get<CredentialsResponse>(`/admin/orders/${orderId}/credentials`)
    setLoading(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal load credentials')
      return
    }
    setCreds(result.data)
    setDraft(result.data.credentials_text)
    setDraftNote(result.data.note ?? '')
    setExpanded(true)
  }

  async function handleCopy() {
    if (!creds) return
    await navigator.clipboard.writeText(creds.credentials_text)
    setCopied(true)
    toast.success('Disalin ke clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  function startEdit() {
    setEditing(true)
    setDraft(creds?.credentials_text ?? '')
    setDraftNote(creds?.note ?? '')
  }

  function cancelEdit() {
    setEditing(false)
    setDraft(creds?.credentials_text ?? '')
    setDraftNote(creds?.note ?? '')
  }

  async function saveEdit() {
    if (!draft.trim() || draft.trim().length < 3) {
      toast.error('Credentials minimal 3 karakter')
      return
    }
    const willResend = resendNotif
    if (!confirm(
      willResend
        ? 'Update credentials + kirim ulang WA & email ke buyer?\n\nBuyer akan dapat notif dengan credentials baru.'
        : 'Update credentials TANPA kirim ulang notif?\n\nBuyer tidak akan diberi tahu (silent update).',
    )) return
    setSaving(true)
    const result = await api.patch<{ ok: true; resent: boolean }>(
      `/admin/orders/${orderId}/credentials`,
      {
        credentials: draft.trim(),
        note: draftNote.trim() || undefined,
        resend_notif: willResend,
      },
    )
    setSaving(false)
    if (!result.ok) {
      toast.error(result.message ?? 'Gagal update credentials')
      return
    }
    toast.success(
      result.data.resent
        ? 'Credentials di-update + notif sudah dikirim ulang ke buyer'
        : 'Credentials di-update (silent, tanpa kirim ulang notif)',
    )
    setCreds({ ...creds!, credentials_text: draft.trim(), note: draftNote.trim() || null })
    setEditing(false)
    router.refresh()
  }

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[0_3px_0_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-extrabold tracking-tight flex items-center gap-2">
          <KeyRound size={18} strokeWidth={2.5} className="text-brand-600" />
          Credentials Buyer
        </h2>
        <button
          type="button"
          onClick={handleExpand}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-white px-3 py-1.5 text-xs font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:bg-brand-50 hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <Loader2 size={12} strokeWidth={2.5} className="animate-spin" />
          ) : expanded ? (
            <EyeOff size={12} strokeWidth={2.5} />
          ) : (
            <Eye size={12} strokeWidth={2.5} />
          )}
          {loading ? 'Memuat...' : expanded ? 'Sembunyikan' : 'Tampilkan'}
        </button>
      </div>

      {!expanded ? (
        <p className="mt-2 text-xs text-ink-muted font-medium">
          Klik Tampilkan untuk lihat & edit credentials yang sudah dikirim ke buyer.
        </p>
      ) : !creds ? null : editing ? (
        // EDIT MODE
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Credentials baru
            </label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-lg border-2 border-black/15 bg-white px-3 py-2 text-sm font-mono text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Catatan internal (opsional)
            </label>
            <input
              type="text"
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              placeholder="Misal: akun diganti karena force logout"
              className="mt-1 w-full rounded-lg border-2 border-black/15 bg-white px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={resendNotif}
              onChange={(e) => setResendNotif(e.target.checked)}
              className="h-4 w-4 accent-brand-500 cursor-pointer"
            />
            <span className="font-medium text-ink">
              Kirim ulang WA + email ke buyer dengan credentials baru
            </span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveEdit}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-success px-4 py-2 text-sm font-extrabold text-white shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black/15 bg-white px-4 py-2 text-sm font-bold text-ink hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <X size={14} />
              Batal
            </button>
          </div>
        </div>
      ) : (
        // VIEW MODE
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border-2 border-black/15 bg-brand-50/40 overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-black/10 bg-white/60 px-3 py-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                Info Akses yang Diterima Buyer
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-900"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Disalin' : 'Salin'}
              </button>
            </div>
            <pre className="px-3 py-2 text-[13px] font-mono text-ink leading-relaxed whitespace-pre-wrap break-words max-h-72 overflow-auto">
              {creds.credentials_text}
            </pre>
          </div>
          {creds.note ? (
            <div className="rounded-lg border-2 border-info/30 bg-info/5 px-3 py-2 text-xs">
              <strong className="text-info">Catatan:</strong>{' '}
              <span className="text-ink-muted">{creds.note}</span>
            </div>
          ) : null}
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-warning px-4 py-2 text-xs font-extrabold text-ink shadow-[0_2px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:shadow-[0_3px_0_rgba(0,0,0,0.9)] transition-all"
          >
            <Edit3 size={12} strokeWidth={2.5} />
            Edit Credentials
          </button>
        </div>
      )}
    </div>
  )
}
