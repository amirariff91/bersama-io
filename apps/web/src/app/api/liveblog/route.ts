import { NextRequest, NextResponse } from 'next/server'

/**
 * Live blog API route
 * Returns paginated liveblog entries for a given topic/event slug.
 * Entries are fetched from Payload CMS (LiveblogEntries collection).
 * Falls back to empty array if CMS is unavailable.
 */

interface LiveblogEntry {
  id: string
  timestamp: string
  author: string
  content: string
  type: 'update' | 'breaking' | 'media' | 'quote'
  mediaUrl?: string
  sourceUrl?: string
}

interface LiveblogResponse {
  entries: LiveblogEntry[]
  slug: string
  lastUpdated: string
  hasMore: boolean
  cursor?: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const cursor = searchParams.get('cursor')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug', code: 'MISSING_SLUG' }, { status: 400 })
  }

  try {
    // TODO: Replace with Payload CMS query when LiveblogEntries collection is created
    // const payload = await getPayload({ config: payloadConfig })
    // const result = await payload.find({
    //   collection: 'liveblog-entries',
    //   where: { slug: { equals: slug } },
    //   sort: '-timestamp',
    //   limit,
    //   ...(cursor ? { page: parseInt(cursor, 10) } : {}),
    // })

    // Placeholder response — real data comes from Payload CMS
    const response: LiveblogResponse = {
      entries: [],
      slug,
      lastUpdated: new Date().toISOString(),
      hasMore: false,
      cursor: undefined,
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (err) {
    console.error('[liveblog] error:', err)
    return NextResponse.json({ error: 'Server error', code: 'SERVER_ERROR' }, { status: 500 })
  }
}
