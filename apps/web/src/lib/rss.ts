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
  const results: RssItem[] = []

  for (const source of RSS_SOURCES) {
    try {
      const res = await fetch(source.url, {
        next: { revalidate: 900 }, // 15-min cache — minimum rate limit per CLAUDE.md
        headers: { 'User-Agent': 'bersama.io/1.0 (+https://bersama.io)' },
      })
      if (!res.ok) continue
      const xml = await res.text()
      // Simple XML parsing — extract <item> blocks
      const items = xml.match(/<item[\s\S]*?<\/item>/g) ?? []
      for (const item of items.slice(0, 20)) {
        const title = item.match(/<title><!\[CDATA\[(.+?)\]\]>|<title>(.+?)<\/title>/)?.[1] ?? ''
        const description = item.match(/<description><!\[CDATA\[(.+?)\]\]>|<description>([\s\S]+?)<\/description>/)?.[1] ?? ''
        const link = item.match(/<link>(.+?)<\/link>/)?.[1] ?? ''
        const pubDate = item.match(/<pubDate>(.+?)<\/pubDate>/)?.[1] ?? ''

        if (!isBersamaRelated({ title, description })) continue

        results.push({
          title: title.trim(),
          excerpt: extractExcerpt(description),
          sourceUrl: link.trim(),
          sourceName: source.name,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          language: source.lang,
        })
      }
    } catch (err) {
      console.error(`[rss] failed to fetch ${source.name}:`, err)
    }
  }

  return results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}
