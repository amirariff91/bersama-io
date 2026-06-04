import type React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import satori from 'satori'
import sharp from 'sharp'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Rate limiting: simple in-memory counter per IP (5 per min)
// Production: replace with Cloudflare WAF rule
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const s3 = new S3Client({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get('cf-connecting-ip') || 'unknown'
  const now = Date.now()

  // Rate limit: 5 per minute per IP
  const rl = rateLimitMap.get(ip)
  if (rl && now < rl.resetAt && rl.count >= 5) {
    return NextResponse.json({ error: 'Rate limit exceeded', code: 'RATE_LIMITED' }, { status: 429 })
  }
  if (!rl || now >= rl.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
  } else {
    rl.count++
  }

  // Check campaign period lock (Electoral Offences Act compliance)
  try {
    const payload = await getPayload({ config: configPromise })
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    if (settings?.campaignPeriodLock) {
      return NextResponse.json(
        { error: 'ID card generation is suspended during the formal campaign period.', code: 'CAMPAIGN_LOCK' },
        { status: 423 }
      )
    }
  } catch {
    // If settings fetch fails, allow through — don't block on config errors
  }

  const body = await req.json() as { name?: unknown; locale?: unknown }
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 50) : ''
  const locale = body.locale === 'en' ? 'en' : 'ms'

  if (!name) {
    return NextResponse.json({ error: 'Name required', code: 'NAME_REQUIRED' }, { status: 400 })
  }

  const cardId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const subtitle = locale === 'ms' ? 'Penyokong Bersama Malaysia' : 'Bersama Malaysia Supporter'
  const since = locale === 'ms' ? `Penyokong sejak Jun 2026` : `Supporter since June 2026`

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          background: '#082448',
          width: '600px',
          height: '380px',
          borderRadius: '16px',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { color: '#E6D44A', fontSize: '28px', fontWeight: 700 },
                    children: 'bersama.io',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { color: '#6B7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px' },
                    children: 'TIDAK RASMI / UNOFFICIAL',
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              children: [
                {
                  type: 'div',
                  props: {
                    style: { color: 'white', fontSize: '38px', fontWeight: 700, lineHeight: 1.2 },
                    children: name,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { color: '#9CA3AF', fontSize: '18px', marginTop: '8px' },
                    children: subtitle,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { color: '#E6D44A', fontSize: '14px' },
                    children: since,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { color: '#6B7280', fontSize: '12px' },
                    children: `#${cardId.slice(-6).toUpperCase()}`,
                  },
                },
              ],
            },
          },
        ],
      },
    } as unknown as React.ReactNode,
    { width: 600, height: 380, fonts: [] }
  )

  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  const key = `id-cards/${cardId}.png`

  // NEVER set ACL on R2 — Cloudflare R2 does not support S3 ACLs
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || '',
    Key: key,
    Body: png,
    ContentType: 'image/png',
  }))

  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`

  return NextResponse.json({ url: publicUrl, cardId })
}
