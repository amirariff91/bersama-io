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

      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={t('placeholder')}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-bersama-blue focus:ring-2 focus:ring-bersama-blue/20 outline-none transition"
      />

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-1 rounded border-gray-300 text-bersama-blue"
        />
        <span className="text-sm text-gray-600">{t('consent')}</span>
      </label>

      <button
        type="submit"
        disabled={!consent || status === 'loading'}
        className="w-full bg-bersama-blue text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {status === 'loading' ? t('loading') : t('button')}
      </button>

      {status === 'success' && (
        <p className="text-green-600 text-sm">{t('success')}</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-sm">{t('error')}</p>
      )}
    </form>
  )
}
