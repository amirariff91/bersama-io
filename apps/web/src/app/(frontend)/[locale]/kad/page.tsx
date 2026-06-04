'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'

export default function KadPage() {
  const t = useTranslations('kad')
  const tHome = useTranslations('home')
  const locale = useLocale()
  const [name, setName] = useState('')
  const [cardUrl, setCardUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/id-card/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, locale }),
      })
      if (!res.ok) throw new Error()
      const data = (await res.json()) as { url: string }
      setCardUrl(data.url)
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const shareText =
    locale === 'ms'
      ? `Saya penyokong Bersama! Lihat kad saya: ${cardUrl} — Jana kad anda di bersama.io/kad`
      : `I'm a Bersama supporter! See my card: ${cardUrl} — Make yours at bersama.io/kad`

  return (
    <>
      <header className="border-b-2 border-ink bg-paper">
        <div className="container-content max-w-xl py-10">
          <p className="kicker">{tHome('idCardKicker')}</p>
          <h1 className="mt-3 font-display text-headline font-black tracking-tight text-ink">
            {t('title')}
          </h1>
          <p className="mt-3 text-pretty text-deck text-ink-muted">{t('description')}</p>
        </div>
      </header>

      <div className="container-content max-w-xl py-12">
        {!cardUrl ? (
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('placeholder')}
              maxLength={50}
              className="input-base"
            />
            <button
              onClick={generate}
              disabled={!name.trim() || loading}
              className="btn-ink w-full"
            >
              {loading ? t('generating') : t('generate')}
            </button>
            {error ? <p className="text-sm font-medium text-bersama-red">{error}</p> : null}
          </div>
        ) : (
          <div className="space-y-4">
            <Image
              src={cardUrl}
              alt={t('title')}
              width={600}
              height={380}
              className="w-full border border-rule"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={cardUrl} download="bersama-supporter-card.png" className="btn-accent flex-1">
                {t('download')}
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ink flex-1"
              >
                {t('share')}
              </a>
            </div>
            <button
              onClick={() => {
                setCardUrl(null)
                setName('')
              }}
              className="w-full text-center font-display text-kicker font-semibold uppercase tracking-[0.1em] text-ink-faint hover:text-ink"
            >
              {t('regenerate')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
