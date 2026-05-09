import { Mail, MessageCircle } from 'lucide-react'

export const metadata = { title: 'Kontak' }

export default function KontakPage() {
  return (
    <section className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-heading text-h1">Kontak</h1>
      <p className="mt-2 text-text-muted">
        Tim support kami siap membantu Anda 24/7 lewat WhatsApp atau email.
      </p>
      <div className="mt-8 space-y-3">
        <a
          href="https://wa.me/628000000000"
          className="flex items-center gap-3 rounded-lg border border-border bg-surface p-5 hover:border-success/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15 text-success">
            <MessageCircle size={20} strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-heading text-h4 text-text">WhatsApp</div>
            <div className="text-sm text-text-muted">+62 800 000 000 — respons &lt; 5 menit</div>
          </div>
        </a>
        <a
          href="mailto:support@jualakun.id"
          className="flex items-center gap-3 rounded-lg border border-border bg-surface p-5 hover:border-primary/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary-light">
            <Mail size={20} strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-heading text-h4 text-text">Email</div>
            <div className="text-sm text-text-muted">support@jualakun.id — respons 1x24 jam</div>
          </div>
        </a>
      </div>
    </section>
  )
}
