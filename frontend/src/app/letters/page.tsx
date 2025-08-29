'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Newsletter = {
  id: number | string
  title: string
  content: string
  field_id: number | null
  tags: string[]
  author_id: number | null
  is_ai_generated: boolean
  status: string
  views: number
  likes: number
  created_at: string
  published_at: string | null
  updated_at: string
  author_name: string
  field_name: string
  is_liked: boolean
  comments_count: number
  is_external?: boolean
  external_url?: string
}

type NewsletterListResponse = {
  newsletters: Newsletter[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export default function LettersPage() {
  const [isDark, setIsDark] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [data, setData] = useState<NewsletterListResponse | null>(null)
  const [includeExternal, setIncludeExternal] = useState(true)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDark(savedTheme === 'dark')
  }, [])

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        setLoading(true)
        setError('')
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        const res = await fetch(`${API_BASE_URL}/newsletters?status=published&page=1&per_page=10&include_external=${includeExternal}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) throw new Error('Failed to load letters')
        const json = await res.json()
        setData(json)
      } catch (e: any) {
        setError(e?.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchLetters()
  }, [API_BASE_URL, includeExternal])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Newsletters</h1>
          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeExternal}
                onChange={(e) => setIncludeExternal(e.target.checked)}
                className="rounded"
              />
              Include External News
            </label>
            <Link href="/letters/ai" className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm">Generate AI Letter</Link>
          </div>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <ul className="space-y-4">
            {data?.newsletters.map((n) => (
              <li key={n.id} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}> 
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{n.title}</h2>
                    <p className="text-sm opacity-70">By {n.author_name} • {n.field_name}</p>
                  </div>
                  <div className="text-xs opacity-70">
                    {n.likes} likes • {n.comments_count} comments
                    {n.is_external && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">External</span>}
                  </div>
                </div>
                <div className="mt-3 prose prose-sm max-w-none dark:prose-invert line-clamp-4" dangerouslySetInnerHTML={{ __html: n.content }} />
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {n.tags?.map((t, i) => (
                    <span key={`${n.id}-tag-${i}`} className={`${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} px-2 py-1 rounded`}>#{t}</span>
                  ))}
                </div>
                {n.is_external && n.external_url && (
                  <div className="mt-3">
                    <a 
                      href={n.external_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Read full article →
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}


