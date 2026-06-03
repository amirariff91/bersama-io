import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['ms', 'en'],
  defaultLocale: 'ms',
  localePrefix: 'always',
})

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|admin|.*\\..*).*)',
  ],
}
