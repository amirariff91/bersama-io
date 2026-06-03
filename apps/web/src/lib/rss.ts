interface RssItem {
  title: string
  excerpt: string // 2-sentence max — copyright compliant
  sourceUrl: string
  sourceName: string
  publishedAt: string
  language: 'ms' | 'en'
}

const RSS_SOURCES = [
  { url: 'https://www.freemalaysiatoday.com/feed/', name: 'Free Malaysia Today', lang: 'en' as const },
  { url: 'https://www.malaymail.com/rss', name: 'Malay Mail', lang: 'en' as const },
  { url: 'https://sinardaily.my/feed', name: 'Sinar Daily', lang: 'ms' as const },
  { url: 'https://thevibes.com/feed', name: 'The Vibes', lang: 'en' as const },
]

const BERSAMA_KEYWORDS = [
  'bersama', 'rafizi', 'nik nazmi', 'parti bersama', 'pbm',
  'bersama malaysia', 'rafizi ramli'
]

// 2-sentence excerpt extractor (copyright compliant)
function extractExcerpt(text: string): string {
  const sentences = text.replace(/<[^>]+>/g, '').split(/(?<=[.!?])\s+/)
  return sentences.slice(0, 2).join(' ').trim()
}

function isBersamaRelated(item: { title?: string; description?: string }): boolean {
  const haystack = `${item.title ?? ''} ${item.description ?? ''}`.toLowerCase()
  return BERSAMA_KEYWORDS.some(kw => haystack.includes(kw))
}

export async function fetchBersamaNews(): Promise<RssItem[]> {
  const allResults = await Promise.all(
    RSS_SOURCES.map(async (source) => {
      const sourceResults: RssItem[] = []
      try {
        const res = await fetch(source.url, {
          next: { revalidate: 900 },
          headers: { 'User-Agent': 'bersama.io/1.0 (+https://bersama.io)' },
        })
        if (!res.ok) return sourceResults
        const xml = await res.text()
        const items = xml.match(/<item[\s\S]*?<\/item>/g) ?? []
        for (const item of items.slice(0, 20)) {
          const titleMatch = item.match(/<title><!\[CDATA\[(.+?)\]\]>|<title>([^<]+)<\/title>/)
          const title = (titleMatch?.[1] ?? titleMatch?.[2] ?? '').trim()
          const descMatch = item.match(/<description><!\[CDATA\[([\s\S]+?)\]\]>|<description>([\s\S]+?)<\/description>/)
          const description = (descMatch?.[1] ?? descMatch?.[2] ?? '').trim()
          const link = item.match(/<link>([^<]+)<\/link>/)?.[1]?.trim() ?? ''
          const pubDate = item.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1] ?? ''
          if (!isBersamaRelated({ title, description })) continue
          sourceResults.push({
            title,
            excerpt: extractExcerpt(description),
            sourceUrl: link,
            sourceName: source.name,
            publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            language: source.lang,
          })
        }
      } catch (err) {
        console.error(`[rss] failed to fetch ${source.name}:`, err)
      }
      return sourceResults
    })
  )
  const results: RssItem[] = allResults.flat()
  return results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}
