/** Locale-aware editorial date formatting (Asia/Kuala_Lumpur). */
export function formatDate(date: string | Date, locale: string): string {
  return new Date(date).toLocaleDateString(locale === 'ms' ? 'ms-MY' : 'en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kuala_Lumpur',
  })
}
