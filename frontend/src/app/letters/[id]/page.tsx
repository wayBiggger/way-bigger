'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Newsletter = {
  id: number
  title: string
  content: string
  author_name: string
  field_name: string
  tags: string[]
  views: number
  likes: number
  created_at: string
  published_at: string
  is_liked: boolean
  comments_count: number
}

export default function NewsletterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [liking, setLiking] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDark(savedTheme === 'dark')
  }, [])

  useEffect(() => {
    const fetchNewsletter = async () => {
      try {
        setLoading(true)
        setError('')
        
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        const response = await fetch(`${API_BASE_URL}/newsletters/${params.id}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Newsletter not found')
          }
          throw new Error('Failed to fetch newsletter')
        }

        const data = await response.json()
        setNewsletter(data)
      } catch (e: any) {
        setError(e?.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchNewsletter()
    }
  }, [params.id, API_BASE_URL])

  const handleLike = async () => {
    if (!newsletter || liking) return

    try {
      setLiking(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/newsletters/${newsletter.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNewsletter(prev => prev ? {
          ...prev,
          is_liked: !prev.is_liked,
          likes: prev.is_liked ? prev.likes - 1 : prev.likes + 1
        } : null)
      }
    } catch (e) {
      console.error('Failed to like newsletter:', e)
    } finally {
      setLiking(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className={`h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-3/4 mb-4`}></div>
            <div className={`h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-8`}></div>
            <div className={`h-64 bg-gray-200 dark:bg-gray-700 rounded-lg`}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="mb-4">{error}</p>
              <Link 
                href="/letters" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                ← Back to Newsletters
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!newsletter) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Newsletter not found</h2>
            <Link 
              href="/letters" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ← Back to Newsletters
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/letters" 
            className={`inline-flex items-center text-sm ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
          >
            ← Back to Newsletters
          </Link>
        </div>

        {/* Article Header */}
        <header className={`mb-8 p-6 rounded-lg ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-sm`}>
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
            }`}>
              {newsletter.field_name}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {newsletter.title}
          </h1>
          
          <div className={`flex flex-wrap items-center gap-4 text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span>👤 {newsletter.author_name}</span>
            <span>📅 {formatDate(newsletter.published_at || newsletter.created_at)}</span>
            <span>👁️ {newsletter.views} views</span>
            <span>💬 {newsletter.comments_count} comments</span>
          </div>

          {newsletter.tags && newsletter.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {newsletter.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded text-xs ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article Content */}
        <article className={`mb-8 p-6 rounded-lg ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-sm`}>
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ 
              __html: newsletter.content.replace(/\n/g, '<br>') 
            }}
          />
        </article>

        {/* Actions */}
        <div className={`p-6 rounded-lg ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-sm`}>
          <div className="flex items-center justify-between">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                newsletter.is_liked
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50`}
            >
              {liking ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{newsletter.is_liked ? '❤️' : '🤍'}</span>
              )}
              <span>{newsletter.likes} {newsletter.likes === 1 ? 'Like' : 'Likes'}</span>
            </button>

            <div className="flex gap-2">
              <button className={`px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
                📤 Share
              </button>
              <button className={`px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
                💬 Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
