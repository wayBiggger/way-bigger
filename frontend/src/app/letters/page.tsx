'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

type Newsletter = {
  id: number | string
  title: string
  description: string
  author: string
  publishedAt: string
  readTime: string
  category: string
  featured: boolean
  isExternal?: boolean
  externalUrl?: string
  source?: string
  icon?: string
}

const categoryColors = {
  'tutorial': "bg-blue-800/40 text-blue-200 border border-blue-500/30",
  'industry': "bg-green-800/40 text-green-200 border border-green-500/30",
  'tools': "bg-purple-800/40 text-purple-200 border border-purple-500/30",
  'career': "bg-orange-800/40 text-orange-200 border border-orange-500/30",
  'ai': "bg-pink-800/40 text-pink-200 border border-pink-500/30",
  'general': "bg-gray-800/40 text-gray-200 border border-gray-500/30"
}

export default function NewslettersPage() {
  const pathname = usePathname()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        setLoading(true)
        setError('')
        
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        
        const response = await fetch(`${API_BASE_URL}/newsletters/?per_page=50&include_external=true`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch newsletters')
        }

        const data = await response.json()
        
        // Transform API data to match component expectations
        const transformedNewsletters = data.newsletters.map((newsletter: any) => ({
          id: newsletter.id,
          title: newsletter.title,
          description: newsletter.content?.substring(0, 150) + '...' || 'No description available',
          author: newsletter.author_name || 'Unknown Author',
          publishedAt: newsletter.published_at || newsletter.created_at,
          readTime: `${Math.ceil((newsletter.content?.length || 0) / 500)} min read`,
          category: newsletter.field_name?.toLowerCase().replace(/\s+/g, '') || newsletter.tags?.[0] || 'general',
          featured: newsletter.likes > 5 || newsletter.views > 100, // Simple featured logic
          isExternal: newsletter.is_external || false,
          externalUrl: newsletter.external_url,
          source: newsletter.source,
          icon: newsletter.icon
        }))
        
        setNewsletters(transformedNewsletters)
      } catch (e: any) {
        setError(e?.message || 'Something went wrong')
        // Fallback to empty array if API fails
        setNewsletters([])
      } finally {
        setLoading(false)
      }
    }
    fetchNewsletters()
  }, [])

  const filteredNewsletters = newsletters.filter(newsletter => {
    const categoryMatch = selectedCategory === 'all' || newsletter.category === selectedCategory
    const searchMatch = searchQuery === '' || 
      newsletter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      newsletter.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      newsletter.author.toLowerCase().includes(searchQuery.toLowerCase())
    
    return categoryMatch && searchMatch
  })

  const featuredNewsletters = newsletters.filter(n => n.featured)
  const regularNewsletters = filteredNewsletters.filter(n => !n.featured)

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'tutorial', name: 'Tutorials' },
    { id: 'industry', name: 'Industry News' },
    { id: 'tools', name: 'Tools & Resources' },
    { id: 'career', name: 'Career Advice' },
    { id: 'ai', name: 'AI & Machine Learning' }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: 'var(--bg-primary)'}}>
      <Navbar currentPath={pathname} />
      
      {/* Animated Background Glows */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glow-pink rounded-full animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-glow-purple rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-glow-cyan rounded-full animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="glass-card mx-4 mt-8 mb-8" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <div className="px-6 py-8">
            <h1 className="text-4xl font-bold mb-4 text-white">
              Developer <span className="text-gradient">Newsletter</span>
            </h1>
            <p className="text-xl text-gray-300">
              Stay updated with the latest trends, tutorials, and insights in software development
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-card mx-4 mb-8 p-6" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search newsletters by title, description, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-10 border border-pink-500/30 rounded-lg bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400"
              style={{ boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)' }}
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="glass-card mx-4 mb-8 p-6" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-pink-500/30 rounded-lg bg-black/50 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400"
                style={{ boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)' }}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id} className="bg-black text-white">{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Results
              </label>
              <div className="p-3 rounded-lg bg-black/50 text-gray-300 border border-pink-500/30" style={{ boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)' }}>
                {filteredNewsletters.length} of {newsletters.length} newsletters
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="space-y-6">
            {/* Loading Header */}
            <div className="animate-pulse">
              <div className={`h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-80 mb-2`}></div>
              <div className={`h-4 bg-gray-200 dark:bg-gray-600 rounded w-96`}></div>
            </div>
            
            {/* Loading Search Bar */}
            <div className="p-4 rounded-lg bg-black/60 border border-pink-500/30 shadow-sm animate-pulse">
              <div className={`h-12 bg-gray-200 dark:bg-gray-700 rounded-lg`}></div>
            </div>

            {/* Loading Category Filter */}
            <div className="p-6 rounded-lg bg-black/60 border border-pink-500/30 shadow-sm animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className={`h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2`}></div>
                  <div className={`h-10 bg-gray-200 dark:bg-gray-700 rounded`}></div>
                </div>
                <div>
                  <div className={`h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2`}></div>
                  <div className={`h-10 bg-gray-200 dark:bg-gray-700 rounded`}></div>
                </div>
              </div>
            </div>

            {/* Loading Featured Articles */}
            <div className="animate-pulse">
              <div className={`h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4`}></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg shadow-lg overflow-hidden border-2 border-yellow-400 bg-black/80 animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className={`h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2`}></div>
                          <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2`}></div>
                        </div>
                        <div className={`h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full`}></div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-full`}></div>
                        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6`}></div>
                        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6`}></div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-24`}></div>
                        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-16`}></div>
                      </div>
                      
                      <div className={`h-10 bg-yellow-300 dark:bg-yellow-600 rounded`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading Regular Articles */}
            <div className="animate-pulse">
              <div className="mb-6">
                <div className={`h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2`}></div>
                <div className={`h-4 bg-gray-200 dark:bg-gray-600 rounded w-48`}></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg shadow-lg overflow-hidden bg-black/80 animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className={`h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2`}></div>
                          <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2`}></div>
                        </div>
                        <div className={`h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full`}></div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-full`}></div>
                        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6`}></div>
                        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6`}></div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-24`}></div>
                        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-16`}></div>
                      </div>
                      
                      <div className={`h-10 bg-gray-300 dark:bg-gray-600 rounded`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Featured Newsletters */}
            {featuredNewsletters.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center animate-fadeIn">
                  <span className="mr-2">⭐</span>
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredNewsletters.map((newsletter, index) => (
                    <div
                      key={newsletter.id}
                      className="group relative bg-black/90 rounded-2xl shadow-lg transition-all duration-500 overflow-hidden border border-yellow-500/50 hover:border-yellow-400/70 backdrop-blur-xl hover:scale-105"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        boxShadow: '0 0 40px rgba(255, 255, 0, 0.2)',
                      }}
                    >
                      {/* Glowing Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 via-orange-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

                      <div className="relative z-10 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors line-clamp-2 flex-1">
                            {newsletter.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {newsletter.icon && (
                              <span className="text-lg">{newsletter.icon}</span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              categoryColors[newsletter.category as keyof typeof categoryColors] || categoryColors['general']
                            }`}>
                              {newsletter.category}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                          {newsletter.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm mb-4 text-gray-400">
                          <span>👤 {newsletter.isExternal ? newsletter.source : newsletter.author}</span>
                          <span>⏱️ {newsletter.readTime}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          {newsletter.isExternal ? (
                            <a
                              href={newsletter.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center py-3 px-6 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                              Read Article →
                            </a>
                          ) : (
                            <Link
                              href={`/letters/${newsletter.id}`}
                              className="flex-1 text-center py-3 px-6 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                              Read Article
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Newsletters */}
            <div className="mb-6 mx-4">
              <h2 className="text-2xl font-bold mb-4 text-white">All Articles</h2>
              <p className="text-gray-300">
                Showing {regularNewsletters.length} of {newsletters.length} articles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4">
              {regularNewsletters.map((newsletter, index) => (
                <div
                  key={newsletter.id}
                  className="group relative bg-black/90 rounded-2xl shadow-lg transition-all duration-500 overflow-hidden border border-pink-500/30 hover:border-pink-400/50 backdrop-blur-xl hover:scale-105"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    boxShadow: '0 0 40px rgba(255, 0, 128, 0.2)',
                  }}
                >
                  {/* Glowing Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-purple-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

                  <div className="relative z-10 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors line-clamp-2 flex-1">
                        {newsletter.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {newsletter.icon && (
                          <span className="text-lg">{newsletter.icon}</span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          categoryColors[newsletter.category as keyof typeof categoryColors] || categoryColors['general']
                        }`}>
                          {newsletter.category}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                      {newsletter.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm mb-4 text-gray-400">
                      <span>👤 {newsletter.isExternal ? newsletter.source : newsletter.author}</span>
                      <span>⏱️ {newsletter.readTime}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {newsletter.isExternal ? (
                        <a
                          href={newsletter.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center py-3 px-6 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                          Read Article →
                        </a>
                      ) : (
                        <Link
                          href={`/letters/${newsletter.id}`}
                          className="flex-1 text-center py-3 px-6 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                          Read Article
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredNewsletters.length === 0 && (
              <div className="text-center py-12 mx-4">
                <p className="text-lg text-gray-300">
                  No newsletters match your current filters. Try adjusting your selection.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}