'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }

    // Listen for theme changes from navigation
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem('theme')
      const newIsDark = currentTheme === 'dark'
      setIsDark(newIsDark)
      
      if (newIsDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <div className={`transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      <Navigation />
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  )
}
