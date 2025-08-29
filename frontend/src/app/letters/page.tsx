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
  source_description?: string
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
  const [selectedCategory, setSelectedCategory] = useState<string>('tech')

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api/v1'

  const categories = [
    { id: 'tech', name: 'Technology', description: 'General tech news and startups' },
    { id: 'ai', name: 'AI & ML', description: 'Artificial intelligence and machine learning' },
    { id: 'webdev', name: 'Web Development', description: 'Frontend, backend, and web technologies' },
    { id: 'mobile', name: 'Mobile Development', description: 'iOS, Android, and mobile apps' },
    { id: 'data-science', name: 'Data Science', description: 'Data analysis and visualization' }
  ]

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
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Newsletters</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Stay updated with the latest insights from top tech companies and influential developers
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h2 className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            Filter by Category
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? isDark
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeExternal}
                onChange={(e) => setIncludeExternal(e.target.checked)}
                className="rounded"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Include external newsletters
              </span>
            </label>
          </div>
        </div>

        {loading && <div className="text-center py-8">Loading newsletters...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && (
          <ul className="space-y-4">
            {data?.newsletters.map((n) => (
              <li key={n.id} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}> 
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{n.title}</h2>
                    <p className="text-sm opacity-70">By {n.author_name} • {n.field_name}</p>
                    {n.is_external && (
                      <p className="text-xs text-blue-600 mt-1">
                        {n.source_description || 'External source'}
                      </p>
                    )}
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


