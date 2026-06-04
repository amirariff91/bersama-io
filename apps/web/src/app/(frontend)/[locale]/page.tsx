import { getTranslations, setRequestLocale } from 'next-intl/server'
import { fetchBersamaNews } from '@/lib/rss'
import { LeadStory } from '@/components/home/LeadStory'
import { StoryGrid } from '@/components/home/StoryGrid'
import { PolicyTrackerRail } from '@/components/home/PolicyTrackerRail'
import { JohorModule } from '@/components/home/JohorModule'
import { NewsletterInline } from '@/components/home/NewsletterInline'

// Match the RSS aggregator cache window (15 min).
export const revalidate = 900

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('common')
  return {
    title: `${t('siteTitle')} — ${t('tagline')}`,
    description: t('unofficial'),
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const news = await fetchBersamaNews()
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://bersama.io'

  return (
    <>
      <LeadStory items={news} locale={locale} />
      <StoryGrid items={news.slice(4, 10)} locale={locale} />
      <PolicyTrackerRail locale={locale} serverUrl={serverUrl} />
      <JohorModule locale={locale} />
      <NewsletterInline locale={locale} />
    </>
  )
}
