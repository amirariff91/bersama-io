'use client'

import { useEffect, useState } from 'react'

interface LivePost {
  id: string
  type: string
  seat?: string
  content: string
  postedAt: string
}

export function LiveBlog() {
  const [posts, setPosts] = useState<LivePost[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

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
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        Dikemaskini: {lastUpdated.toLocaleTimeString('ms-MY')}
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
          <p className="font-medium">Kemaskini akan muncul di sini semasa keputusan</p>
          <p className="text-sm mt-1 text-gray-400">
            Updates will appear here during results
          </p>
        </div>
      ) : (
        posts.map(post => (
          <div
            key={post.id}
            className="border-l-4 border-bersama-yellow pl-4 py-2 bg-white rounded-r-lg shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-semibold uppercase bg-bersama-blue text-white px-2 py-0.5 rounded">
                {post.type}
              </span>
              {post.seat && (
                <span className="text-xs text-gray-500">{post.seat}</span>
              )}
              <span className="text-xs text-gray-400 ml-auto">
                {new Date(post.postedAt).toLocaleTimeString('ms-MY')}
              </span>
            </div>
            <p className="text-sm text-gray-800">{post.content}</p>
          </div>
        ))
      )}
    </div>
  )
}
