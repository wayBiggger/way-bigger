'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth } from '@/utils/auth'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()

  // Check for saved theme preference or default to light
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(auth.isAuthenticated())
    }
    
    checkAuth()
    
    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = async () => {
    try {
      await auth.logout()
      setIsAuthenticated(false)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if server request fails
      auth.clearAuth()
      setIsAuthenticated(false)
      window.location.href = '/'
    }
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'Tracks', href: '/tracks' },
    { name: 'Community', href: '/community' },
    { name: 'Newsletter', href: '/letters' },
    { name: 'AI Assistant', href: '/ai-assistant' },
    { name: 'Code Editor', href: '/code-editor' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className={`transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white shadow-gray-800' : 'bg-white text-gray-900 shadow'
    } shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className={`text-2xl font-black ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`}>
                Way Bigger
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? isDark 
                        ? 'border-blue-400 text-blue-300' 
                        : 'border-blue-500 text-blue-600'
                      : isDark
                        ? 'border-transparent text-gray-300 hover:border-gray-600 hover:text-gray-100'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* Conditional rendering based on authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    isDark 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isDark 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isDark 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    isDark 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            {/* Theme Toggle for Mobile */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg mr-2 transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700 text-yellow-300' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-200 ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-500 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className={`sm:hidden transition-colors duration-300 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? isDark
                      ? 'bg-blue-900 border-blue-400 text-blue-300'
                      : 'bg-blue-50 border-blue-500 text-blue-700'
                    : isDark
                      ? 'border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-600'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  href="/profile"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                    isActive('/profile')
                      ? isDark
                        ? 'bg-blue-900 border-blue-400 text-blue-300'
                        : 'bg-blue-50 border-blue-500 text-blue-700'
                      : isDark
                        ? 'border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-600'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleLogout()
                  }}
                  className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                    isDark
                      ? 'border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-600'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  Logout
                </button>
              </>
            )}
          </div>
          <div className={`pt-4 pb-3 border-t transition-colors duration-300 ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className={`block pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200 ${
                      isDark 
                        ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' 
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleLogout()
                    }}
                    className={`block w-full text-left pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200 ${
                      isDark 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className={`block pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200 ${
                      isDark 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className={`block pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200 ${
                      isDark 
                        ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' 
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
