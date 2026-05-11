'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImagePlus } from 'lucide-react'
import { useToast } from '@/components/toast'
import { createBrowserClient } from '@/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787'
const MAX_SIZE_MB = 2
const ALLOWED_EXT = '.webp,.png,.jpg,.jpeg'

/**
 * Baca dimensi gambar via createImageBitmap (modern) atau Image() fallback.
 * Return { width, height } dalam pixel.
 */
async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  // Pakai createImageBitmap kalau available (faster, lebih low-level)
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file)
      const dim = { width: bitmap.width, height: bitmap.height }
      bitmap.close()
      return dim
    } catch {
      // Fallback ke Image()
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    // Pakai window.Image — jangan `new Image()` karena `Image` di file ini
    // sudah di-import dari next/image (React component, bukan DOM constructor)
    const img = new window.Image()
    img.onload = () => {
      const dim = { width: img.naturalWidth, height: img.naturalHeight }
      URL.revokeObjectURL(url)
      resolve(dim)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image decode failed'))
    }
    img.src = url
  })
}

type Props = {
  /** Current URL value (atau kosong) */
  value: string
  /** Dipanggil dgn URL baru setelah upload sukses, atau kosong saat di-clear */
  onChange: (url: string) => void
  /** Untuk file naming di backend (mis. slug produk) */
  slug?: string
}

/**
 * ThumbnailUpload — file picker + auto-upload ke backend → Supabase Storage.
 * Backend handle validasi (size, type, naming) dan return public URL.
 *
 * UX:
 *  - Klik area drop / button → file picker
 *  - Saat upload: progress overlay dgn spinner
 *  - Setelah sukses: preview image + tombol X untuk hapus
 *  - Validasi client-side dulu (size, type) sebelum kirim ke backend
 */
export function ThumbnailUpload({ value, onChange, slug }: Props) {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    // Client-side validation (cepat, sebelum kirim)
    const sizeMB = file.size / 1024 / 1024
    if (sizeMB > MAX_SIZE_MB) {
      toast.error(`File ${sizeMB.toFixed(1)} MB melebihi maks ${MAX_SIZE_MB} MB`)
      return
    }
    const allowed = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg']
    if (!allowed.includes(file.type)) {
      toast.error('Tipe file harus WebP, PNG, atau JPEG')
      return
    }

    // Validasi aspect ratio 1:1 (toleransi 2% supaya nggak ribet untuk gambar
    // hasil export tools yg kadang off by 1-2 pixel)
    try {
      const dimensions = await readImageDimensions(file)
      const ratio = dimensions.width / dimensions.height
      if (Math.abs(ratio - 1) > 0.02) {
        toast.error(
          `Gambar harus rasio 1:1 (square). Ukuran kamu: ${dimensions.width}×${dimensions.height} px (rasio ${ratio.toFixed(2)})`,
        )
        return
      }
    } catch {
      toast.error('Gagal membaca dimensi gambar — file mungkin corrupt')
      return
    }

    setUploading(true)

    // Pull JWT untuk Authorization header
    const supabase = createBrowserClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    const fd = new FormData()
    fd.append('file', file)
    if (slug) fd.append('slug', slug)

    try {
      const res = await fetch(`${API_URL}/admin/upload/thumbnail`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      })
      const json = (await res.json()) as
        | { data: { url: string } }
        | { ok: false; message: string }

      if (!res.ok || 'ok' in json) {
        const msg = 'message' in json ? json.message : 'Upload gagal'
        toast.error(msg)
        setUploading(false)
        return
      }

      onChange(json.data.url)
      toast.success('Thumbnail berhasil di-upload ✓')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload gagal')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleClear() {
    onChange('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept={ALLOWED_EXT}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />

      {value ? (
        <div className="relative inline-block rounded-xl border-2 border-black bg-white shadow-[0_3px_0_rgba(0,0,0,0.9)] overflow-hidden">
          <div className="relative w-40 h-40">
            <Image src={value} alt="Thumbnail produk" fill sizes="160px" className="object-cover" />
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-t-2 border-black/10 bg-brand-50/40">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 underline underline-offset-2 disabled:opacity-50"
            >
              Ganti gambar
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={uploading}
              aria-label="Hapus thumbnail"
              className="rounded p-1 text-ink-muted hover:bg-white hover:text-danger disabled:opacity-50"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-2 w-40 h-40 rounded-xl border-2 border-dashed border-black/30 bg-brand-50/40 hover:bg-brand-50 hover:border-brand-500 transition-colors text-ink-muted hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 size={28} strokeWidth={2} className="animate-spin text-brand-600" />
              <span className="text-xs font-bold">Mengupload...</span>
            </>
          ) : (
            <>
              <ImagePlus size={28} strokeWidth={2} />
              <span className="text-xs font-bold">Pilih Gambar</span>
            </>
          )}
        </button>
      )}

      <p className="mt-2 text-xs text-ink-subtle font-medium leading-relaxed">
        Rasio <strong>1:1 (square)</strong> · Format <strong>WebP</strong> (recommended), PNG, atau
        JPEG · Maks {MAX_SIZE_MB} MB · Auto-upload ke storage
      </p>
    </div>
  )
}
