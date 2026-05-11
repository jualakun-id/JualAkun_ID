import { Hono } from 'hono'
import { createAdminClient } from '@/lib/supabase'
import { ApiError } from '@/types/errors'
import type { AppEnv } from '@/types/bindings'

export const adminUploadRoute = new Hono<AppEnv>()

const BUCKET = 'product-thumbnails'
const ALLOWED_TYPES = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

/**
 * POST /admin/upload/thumbnail
 * Form multipart: file (image), slug (string, optional — for naming)
 *
 * Upload gambar ke bucket Supabase Storage `product-thumbnails`. Return public URL.
 * Validasi: max 2MB, allowed types webp/png/jpeg.
 *
 * Naming convention: {slug-or-uuid}-{timestamp}.{ext}
 * Public bucket → URL accessible langsung tanpa auth.
 */
adminUploadRoute.post('/thumbnail', async (c) => {
  let form: FormData
  try {
    form = await c.req.formData()
  } catch {
    throw new ApiError('VALIDATION_ERROR', 'Body harus form-data', 400)
  }

  const file = form.get('file') as File | null
  if (!file || typeof file === 'string') {
    throw new ApiError('VALIDATION_ERROR', 'File tidak ditemukan di form', 400)
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ApiError(
      'VALIDATION_ERROR',
      `Tipe file ${file.type} tidak diizinkan. Gunakan WebP / PNG / JPEG.`,
      400,
    )
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new ApiError(
      'VALIDATION_ERROR',
      `Ukuran file ${(file.size / 1024 / 1024).toFixed(1)} MB melebihi maksimal 2 MB`,
      400,
    )
  }

  // Naming: {slug}-{timestamp}.{ext} kalau slug ada, else {uuid}.{ext}
  const slugRaw = (form.get('slug') as string | null) ?? ''
  const slug = slugRaw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 60)
  const ext =
    file.type === 'image/webp' ? 'webp' :
    file.type === 'image/png' ? 'png' : 'jpg'
  const baseName = slug || crypto.randomUUID()
  const fileName = `${baseName}-${Date.now()}.${ext}`

  const supabase = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      cacheControl: '31536000', // 1 year
      upsert: false,
    })

  if (uploadError) {
    throw new ApiError('INTERNAL_ERROR', `Storage upload gagal: ${uploadError.message}`, 500)
  }

  // Build public URL
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(fileName)

  return c.json(
    {
      data: {
        url: pub.publicUrl,
        path: fileName,
        size: file.size,
        type: file.type,
      },
    },
    201,
  )
})
