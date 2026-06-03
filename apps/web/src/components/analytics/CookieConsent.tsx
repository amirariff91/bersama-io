'use client'
import { useEffect, useState } from 'react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('bersama_cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('bersama_cookie_consent', 'accepted')
    window.dispatchEvent(new Event('bersama_consent_update'))
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('bersama_cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#082448',
        color: 'white',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <p style={{ margin: 0, flex: 1, fontSize: '14px', lineHeight: 1.5 }}>
        Kami menggunakan kuki untuk meningkatkan pengalaman anda.{' '}
        <span style={{ color: '#9CA3AF' }}>
          We use cookies to improve your experience. (PDPA compliant)
        </span>
      </p>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            background: 'transparent',
            border: '1px solid #6B7280',
            color: '#9CA3AF',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Tolak / Decline
        </button>
        <button
          onClick={accept}
          style={{
            background: '#E6D44A',
            border: 'none',
            color: '#082448',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Terima / Accept
        </button>
      </div>
    </div>
  )
}
