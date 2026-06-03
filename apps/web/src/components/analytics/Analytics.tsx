'use client'
import Script from 'next/script'
import { useEffect, useState } from 'react'

export function Analytics() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('bersama_cookie_consent')
    if (consent === 'accepted') setConsented(true)
    const handler = () => setConsented(localStorage.getItem('bersama_cookie_consent') === 'accepted')
    window.addEventListener('bersama_consent_update', handler)
    return () => window.removeEventListener('bersama_consent_update', handler)
  }, [])

  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID

  if (!consented) return null

  return (
    <>
      {ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga4Id}');`}
          </Script>
        </>
      )}
      {clarityId && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${clarityId}");`}
        </Script>
      )}
    </>
  )
}
