'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Newsletter = {
  id: number
  title: string
  description: string
  author: string
  publishedAt: string
  readTime: string
  category: string
  featured: boolean
}

const categoryColors = {
  'tutorial': "bg-blue-100 text-blue-800",
  'industry': "bg-green-100 text-green-800",
  'tools': "bg-purple-100 text-purple-800",
  'career': "bg-orange-100 text-orange-800",
  'ai': "bg-pink-100 text-pink-800"
}

const darkCategoryColors = {
  'tutorial': "bg-blue-900 text-blue-200",
  'industry': "bg-green-900 text-green-200",
  'tools': "bg-purple-900 text-purple-200",
  'career': "bg-orange-900 text-orange-200",
  'ai': "bg-pink-900 text-pink-200"
}

export default function NewslettersPage() {
  const [isDark, setIsDark] = useState(false)
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDark(savedTheme === 'dark')
  }, [])

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Mock newsletters data
        const mockNewsletters = [
          {
            id: 1,
            title: "Getting Started with React Hooks",
            description: "Learn the fundamentals of React Hooks and how to use them effectively in your applications.",
            author: "Sarah Johnson",
            publishedAt: "2024-01-15T10:00:00Z",
            readTime: "5 min read",
            category: "tutorial",
            featured: true
          },
          {
            id: 2,
            title: "The Future of Web Development in 2024",
            description: "Explore the latest trends and technologies shaping the web development landscape.",
            author: "Mike Chen",
            publishedAt: "2024-01-12T14:30:00Z",
            readTime: "8 min read",
            category: "industry",
            featured: true
          },
          {
            id: 3,
            title: "Essential VS Code Extensions for Developers",
            description: "Discover the must-have VS Code extensions that will boost your productivity.",
            author: "Alex Rodriguez",
            publishedAt: "2024-01-10T09:15:00Z",
            readTime: "6 min read",
            category: "tools",
            featured: false
          },
          {
            id: 4,
            title: "Building Your First AI Application",
            description: "Step-by-step guide to creating your first AI-powered application using modern tools.",
            author: "Dr. Emily Watson",
            publishedAt: "2024-01-08T16:45:00Z",
            readTime: "12 min read",
            category: "ai",
            featured: true
          },
          {
            id: 5,
            title: "Career Tips for Junior Developers",
            description: "Practical advice for junior developers looking to advance their careers.",
            author: "David Kim",
            publishedAt: "2024-01-05T11:20:00Z",
            readTime: "7 min read",
            category: "career",
            featured: false
          },
          {
            id: 6,
            title: "Mastering TypeScript: Advanced Patterns",
            description: "Deep dive into advanced TypeScript patterns and best practices.",
            author: "Lisa Wang",
            publishedAt: "2024-01-03T13:10:00Z",
            readTime: "10 min read",
            category: "tutorial",
            featured: false
          },
          {
            id: 7,
            title: "The Rise of Edge Computing",
            description: "Understanding how edge computing is changing the way we build applications.",
            author: "James Wilson",
            publishedAt: "2024-01-01T08:30:00Z",
            readTime: "9 min read",
            category: "industry",
            featured: false
          },
          {
            id: 8,
            title: "Git Workflow Best Practices",
            description: "Learn professional Git workflows used by top development teams.",
            author: "Maria Garcia",
            publishedAt: "2023-12-28T15:00:00Z",
            readTime: "6 min read",
            category: "tools",
            featured: false
          }
        ]

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setNewsletters(mockNewsletters)
      } catch (e: any) {
        setError(e?.message || 'Something went wrong')
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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Developer Newsletter</h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Stay updated with the latest trends, tutorials, and insights in software development
          </p>
        </div>

        {/* Search Bar */}
        <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-all duration-300 animate-fadeIn`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search newsletters by title, description, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full p-3 pl-10 rounded-lg border transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-all duration-300 animate-fadeIn`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full p-3 border rounded-lg transition-all duration-200 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500' : 'bg-white border-gray-300 hover:border-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
                Results
              </label>
              <div className={`p-3 rounded-lg transition-all duration-200 ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                <span className="animate-fadeIn">{filteredNewsletters.length}</span> of <span className="animate-fadeIn">{newsletters.length}</span> newsletters
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
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm animate-pulse`}>
              <div className={`h-12 bg-gray-200 dark:bg-gray-700 rounded-lg`}></div>
            </div>

            {/* Loading Category Filter */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm animate-pulse`}>
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
                    className={`rounded-lg shadow-lg overflow-hidden border-2 border-yellow-400 ${isDark ? 'bg-gray-800' : 'bg-white'} animate-pulse`}
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
                    className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} animate-pulse`}
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
                      className={`rounded-lg shadow-lg overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-xl border-2 border-yellow-400 ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      } animate-fadeInUp`}
                      style={{ 
                        animationDelay: `${index * 150}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-semibold mb-2">{newsletter.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isDark ? darkCategoryColors[newsletter.category as keyof typeof darkCategoryColors] : categoryColors[newsletter.category as keyof typeof categoryColors]
                          }`}>
                            {newsletter.category}
                          </span>
                        </div>
                        
                        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {newsletter.description}
                        </p>
                        
                        <div className={`flex items-center justify-between text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span>👤 {newsletter.author}</span>
                          <span>⏱️ {newsletter.readTime}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link
                            href={`/letters/${newsletter.id}`}
                            className={`flex-1 text-center py-2 px-4 rounded-md font-medium transition-colors ${
                              isDark
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            }`}
                          >
                            Read Article
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Newsletters */}
            <div className="mb-6 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-4">All Articles</h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Showing {regularNewsletters.length} of {newsletters.length} articles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularNewsletters.map((newsletter, index) => (
                <div
                  key={newsletter.id}
                  className={`rounded-lg shadow-lg overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-xl ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } animate-fadeInUp`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold mb-2">{newsletter.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDark ? darkCategoryColors[newsletter.category as keyof typeof darkCategoryColors] : categoryColors[newsletter.category as keyof typeof categoryColors]
                      }`}>
                        {newsletter.category}
                      </span>
                    </div>
                    
                    <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {newsletter.description}
                    </p>
                    
                    <div className={`flex items-center justify-between text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>👤 {newsletter.author}</span>
                      <span>⏱️ {newsletter.readTime}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/letters/${newsletter.id}`}
                        className={`flex-1 text-center py-2 px-4 rounded-md font-medium transition-colors ${
                          isDark
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Read Article
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredNewsletters.length === 0 && (
              <div className="text-center py-12">
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
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