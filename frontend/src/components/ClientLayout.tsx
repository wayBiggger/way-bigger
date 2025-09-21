'use client'

import { useEffect, useState } from 'react'
import PerformanceMonitor from '@/components/PerformanceMonitor'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('dark')
      }
    } else {
      setIsDark(false)
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark')
      }
    }

    // Listen for theme changes from navigation
    const handleStorageChange = () => {
      const currentTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
      const newIsDark = currentTheme === 'dark'
      setIsDark(newIsDark)
      
      if (typeof document !== 'undefined') {
        if (newIsDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <div className={`transition-colors duration-300 ${isDark ? 'dark' : ''}`} style={{background: 'var(--bg-primary)'}}>
      <PerformanceMonitor />
      <main className="min-h-screen relative">
        {/* Global Neon Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glow-pink rounded-full animate-float opacity-30"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-glow-purple rounded-full animate-float opacity-30" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-glow-cyan rounded-full animate-float opacity-30" style={{animationDelay: '4s'}}></div>
        </div>
        {children}
      </main>
    </div>
  )
}
