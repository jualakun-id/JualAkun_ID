'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

type FAQ = {
  q: string
  a: string
}

export function FAQAccordion({ items }: { items: FAQ[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIdx === idx
        return (
          <div
            key={item.q}
            className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-[0_3px_0_rgba(0,0,0,0.9)] hover:shadow-[0_4px_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="w-full flex justify-between items-center px-5 py-4 gap-3"
            >
              <span className="text-ink font-bold text-[17px] flex-1 text-center md:text-left">{item.q}</span>
              <ChevronDown
                className={`w-5 h-5 text-ink-subtle shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-brand-500' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-ink-muted text-[15px] leading-relaxed text-center md:text-left font-medium">{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
