import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: fetch from Payload CMS when DATABASE_URL is configured
  // Articles published in last 2 days are eligible for Google News
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Articles will appear here once content is published -->
  <!-- This sitemap must be submitted to Google News Publisher Center -->
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
