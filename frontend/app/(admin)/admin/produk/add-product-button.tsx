'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { ProductForm } from './product-form'
import type { Category } from '@/types'

type Props = {
  categories: Category[]
}

/**
 * Tombol "+ Tambah Produk" yang trigger Modal berisi ProductForm.
 * ProductForm yg sudah ada handle: submit ke backend, toast success/error,
 * router.refresh() — kita cuma butuh close modal setelah success.
 */
export function AddProductButton({ categories }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-ink font-extrabold px-5 py-2.5 text-sm border-2 border-black shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_5px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.9)] transition-all duration-150"
      >
        <Plus size={16} strokeWidth={2.5} />
        Tambah Produk
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tambah Produk Baru"
        description="Status default = draft (tidak tampil di publik). Kamu bisa aktifkan setelah stok siap."
        size="xl"
      >
        <ProductForm
          categories={categories}
          embedded
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}
