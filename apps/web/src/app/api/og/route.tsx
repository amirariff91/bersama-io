import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'bersama.io'
  const locale = searchParams.get('locale') || 'ms'
  const subtitle = locale === 'ms' ? 'Suara Penyokong, Bebas & Berani' : "Supporter's Voice, Free & Bold"

  return new ImageResponse(
    (
      <div
        style={{
          background: '#082448',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div style={{ color: '#E6D44A', fontSize: 28, fontWeight: 600, marginBottom: 16 }}>
          bersama.io
        </div>
        <div style={{ color: 'white', fontSize: 52, fontWeight: 700, lineHeight: 1.2, maxWidth: 900 }}>
          {title}
        </div>
        <div style={{ color: '#9CA3AF', fontSize: 24, marginTop: 24 }}>
          {subtitle}
        </div>
        <div style={{ color: '#6B7280', fontSize: 14, marginTop: 'auto' }}>
          Platform penyokong tidak rasmi • Unofficial supporter platform
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
