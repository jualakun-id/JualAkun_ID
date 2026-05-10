'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  children: React.ReactNode
  /** stagger delay group: 1, 2, or 3 (≈ 80/160/240ms) */
  delay?: 1 | 2 | 3
  /** as which element to render */
  as?: 'div' | 'section' | 'article'
  className?: string
}

/**
 * Reveal — fade-up + slight slide that triggers when element scrolls into view.
 * Respects prefers-reduced-motion (disabled via globals.css).
 * Single IntersectionObserver per instance, disconnected after first trigger.
 */
export function Reveal({ children, delay, as: Tag = 'div', className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || shown) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [shown])

  const delayClass = delay ? `reveal-delay-${delay}` : ''

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`reveal ${shown ? 'reveal-in' : ''} ${delayClass} ${className}`.trim()}
    >
      {children}
    </Tag>
  )
}
