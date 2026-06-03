'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function KadPage() {
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
        body: JSON.stringify({ name, locale: 'ms' }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json() as { url: string }
      setCardUrl(data.url)
    } catch {
      setError('Gagal menjana kad. Cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-bersama-blue mb-2">Kad Penyokong Bersama</h1>
      <p className="text-gray-600 mb-8">Jana kad penyokong anda dan kongsi di WhatsApp atau Instagram.</p>

      {!cardUrl ? (
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nama anda"
            maxLength={50}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-bersama-blue outline-none"
          />
          <button
            onClick={generate}
            disabled={!name.trim() || loading}
            className="w-full bg-bersama-blue text-white py-3 rounded-lg font-semibold hover:bg-bersama-blue-light disabled:opacity-50 transition-colors"
          >
            {loading ? 'Menjana...' : 'Jana Kad Saya'}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <Image src={cardUrl} alt="Kad Penyokong Bersama" width={600} height={380} className="rounded-xl w-full" />
          <div className="flex gap-3">
            <a
              href={cardUrl}
              download="bersama-supporter-card.png"
              className="flex-1 bg-bersama-yellow text-bersama-blue text-center py-3 rounded-lg font-semibold hover:bg-bersama-yellow-light transition-colors"
            >
              Muat Turun
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Saya penyokong Bersama! Lihat kad saya: ${cardUrl} — Jana kad anda di bersama.io/kad`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Kongsi WhatsApp
            </a>
          </div>
          <button
            onClick={() => { setCardUrl(null); setName('') }}
            className="text-sm text-gray-400 hover:text-gray-600 w-full text-center"
          >
            Jana semula
          </button>
        </div>
      )}
    </main>
  )
}
