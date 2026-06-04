'use client'

import { useEffect, useState } from 'react'

interface LivePost {
  id: string
  type: string
  seat?: string
  content: string
  postedAt: string
}

export function LiveBlog({ locale }: { locale: string }) {
  const isMs = locale === 'ms'
  const timeLocale = isMs ? 'ms-MY' : 'en-MY'
  const [posts, setPosts] = useState<LivePost[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/liveblog')
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts || [])
          setLastUpdated(new Date())
        }
      } catch {
        // silent fail — network errors during election night are expected
      }
    }

    fetchPosts()
    const interval = setInterval(fetchPosts, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-5">
      {lastUpdated ? (
        <p className="text-xs text-ink-faint" suppressHydrationWarning>
          {isMs ? 'Dikemaskini' : 'Updated'}:{' '}
          {lastUpdated.toLocaleTimeString(timeLocale)}
        </p>
      ) : null}

      {posts.length === 0 ? (
        <div className="border-t border-rule pt-5">
          <p className="font-display font-bold text-ink">
            {isMs
              ? 'Kemaskini akan muncul di sini semasa keputusan'
              : 'Updates will appear here during results'}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {isMs
              ? 'Pantau ruangan ini pada malam pengiraan undi.'
              : 'Watch this space on counting night.'}
          </p>
        </div>
      ) : (
        <ol className="space-y-5">
          {posts.map((post) => (
            <li key={post.id} className="border-l-2 border-bersama-red pl-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="tag-live">{post.type}</span>
                {post.seat ? (
                  <span className="text-xs text-ink-faint">{post.seat}</span>
                ) : null}
                <time className="ml-auto text-xs text-ink-faint" suppressHydrationWarning>
                  {new Date(post.postedAt).toLocaleTimeString(timeLocale)}
                </time>
              </div>
              <p className="text-sm leading-relaxed text-ink">{post.content}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
