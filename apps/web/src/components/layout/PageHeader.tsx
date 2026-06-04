import type { ReactNode } from 'react'

interface PageHeaderProps {
  kicker?: string
  title: string
  deck?: string
  children?: ReactNode
}

/**
 * Shared editorial page header (replaces the old per-page blue heros).
 * Kicker → headline → deck on paper, closed by a masthead rule.
 */
export function PageHeader({ kicker, title, deck, children }: PageHeaderProps) {
  return (
    <header className="border-b-2 border-ink bg-paper">
      <div className="container-content py-10 sm:py-14">
        {kicker ? <p className="kicker">{kicker}</p> : null}
        <h1 className="mt-3 max-w-3xl text-balance font-display text-headline font-black tracking-tight text-ink">
          {title}
        </h1>
        {deck ? (
          <p className="mt-3 max-w-2xl text-pretty text-deck text-ink-muted">{deck}</p>
        ) : null}
        {children}
      </div>
    </header>
  )
}
