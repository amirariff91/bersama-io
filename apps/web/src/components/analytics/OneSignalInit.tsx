'use client'
import { useEffect } from 'react'

export function OneSignalInit() {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

  useEffect(() => {
    if (!appId) return
    // Load OneSignal SDK
    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    script.async = true
    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || []
      window.OneSignalDeferred.push(async (OneSignal: OneSignalType) => {
        await OneSignal.init({
          appId,
          notifyButton: { enable: false },
          welcomeNotification: { disable: true },
        })
      })
    }
    document.head.appendChild(script)
  }, [appId])

  return null
}

// Type stub for OneSignal SDK
declare global {
  interface Window {
    OneSignalDeferred: ((os: OneSignalType) => void)[]
  }
}

type OneSignalType = {
  init: (config: Record<string, unknown>) => Promise<void>
}
