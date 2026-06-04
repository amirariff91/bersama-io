import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createHash } from 'crypto'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Lazily construct Resend only when a key is configured — the constructor
// throws on an empty key, which would break `next build` page-data collection.
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  return key ? new Resend(key) : null
}

// Rate limit: 3 subscribes per 5 minutes per IP
const subRateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const rl = subRateLimitMap.get(ip)
    if (rl && now < rl.resetAt && rl.count >= 3) {
      return NextResponse.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, { status: 429 })
    }
    if (!rl || now >= rl.resetAt) {
      subRateLimitMap.set(ip, { count: 1, resetAt: now + 300_000 })
    } else {
      rl.count++
    }

    const body = await req.json() as { email?: unknown; consent?: unknown }
    const { email, consent } = body

    // Validate
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email', code: 'INVALID_EMAIL' }, { status: 400 })
    }
    if (consent !== true) {
      return NextResponse.json({ error: 'Consent required', code: 'NO_CONSENT' }, { status: 400 })
    }
    // PDPA: no IC numbers
    if (/\d{12}/.test(email)) {
      return NextResponse.json({ error: 'Invalid email', code: 'INVALID_EMAIL' }, { status: 400 })
    }

    const ipRaw = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'
    const ipHash = createHash('sha256').update(ipRaw).digest('hex')
    // Consent audit trail — stored with subscription record
    const _consentText = 'Saya bersetuju data saya diproses oleh bersama.io dan pembekal perkhidmatan kami, termasuk pembekal di luar Malaysia, bagi tujuan menerima kemaskini berita.'

    console.info('[subscribe] new subscriber', { emailDomain: email.split('@')[1], ipHash, timestamp: new Date().toISOString() })

    // Sync to Listmonk (Basic Auth — NOT token auth)
    const listmonkUrl = process.env.LISTMONK_URL
    const listmonkUsername = process.env.LISTMONK_USERNAME
    const listmonkPassword = process.env.LISTMONK_PASSWORD
    if (listmonkUrl && listmonkUsername && listmonkPassword) {
      const basicAuth = Buffer.from(`${listmonkUsername}:${listmonkPassword}`).toString('base64')
      const res = await fetch(`${listmonkUrl}/api/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          email,
          name: email.split('@')[0],
          status: 'enabled',
          lists: [parseInt(process.env.LISTMONK_LIST_ID ?? '1', 10)],
          preconfirm_subscriptions: true,
        }),
      })
      if (!res.ok && res.status !== 409) {
        const errText = await res.text()
        throw new Error(`Listmonk error: ${res.status} ${errText}`)
      }
    }

    // Write PDPA audit record to Members collection
    try {
      const payload = await getPayload({ config: configPromise })
      await payload.create({
        collection: 'members',
        data: {
          email,
          subscribedAt: new Date().toISOString(),
          consentText: 'Saya bersetuju data saya diproses oleh bersama.io dan pembekal perkhidmatan kami, termasuk pembekal di luar Malaysia, bagi tujuan menerima kemaskini berita.',
          ipHash,
          isActive: true,
        },
      })
    } catch (pdpaErr) {
      // Log but don't fail — Listmonk already has the record
      console.error('[subscribe] PDPA record write failed:', pdpaErr)
    }

    // Send welcome email via Resend (skipped when no key is configured)
    const resend = getResend()
    if (resend) {
      await resend.emails.send({
        from: 'bersama.io <hello@bersama.io>',
        to: email,
        subject: 'Selamat datang ke bersama.io — Suara Penyokong, Bebas & Berani',
        html: `
          <h1>Terima kasih kerana melanggan bersama.io!</h1>
          <p>Anda akan menerima kemaskini terkini tentang Parti Bersama Malaysia.</p>
          <p style="font-size:12px;color:#666;">bersama.io adalah platform penyokong TIDAK RASMI. Kami tidak berkaitan dengan Parti Bersama Malaysia.</p>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[subscribe] error:', err)
    return NextResponse.json({ error: 'Server error', code: 'SERVER_ERROR' }, { status: 500 })
  }
}
