'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function NewsletterForm() {
  const t = useTranslations('subscribe')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  // honeypot field — hidden from real users, filled only by bots
  const [honeypot, setHoneypot] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) return // bot detected — silent drop
    if (!consent) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: true }),
      })
      if (!res.ok) throw new Error('Subscribe failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot — hidden from real users */}
      <div className="hidden" aria-hidden="true">
        <input
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={e => setHoneypot(e.target.value)}
        />
      </div>

      <label htmlFor="newsletter-email" className="sr-only">
        {t('placeholder')}
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={t('placeholder')}
        className="input-base"
      />

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 border-rule text-bersama-blue focus:ring-bersama-blue"
        />
        <span className="text-xs leading-relaxed text-ink-muted">{t('consent')}</span>
      </label>

      <button
        type="submit"
        disabled={!consent || status === 'loading'}
        className="btn-ink w-full"
      >
        {status === 'loading' ? t('loading') : t('button')}
      </button>

      {status === 'success' && (
        <p className="text-sm font-medium text-bersama-blue">{t('success')}</p>
      )}
      {status === 'error' && (
        <p className="text-sm font-medium text-bersama-red">{t('error')}</p>
      )}
    </form>
  )
}
