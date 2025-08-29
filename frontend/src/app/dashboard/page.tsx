'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [isDark, setIsDark] = useState(false)
  const [welcome, setWelcome] = useState('')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDark(savedTheme === 'dark')
    const name = localStorage.getItem('user_full_name') || ''
    setWelcome(name ? `Welcome back, ${name.split(' ')[0]}!` : 'Welcome back!')
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">{welcome}</h1>
        <div className={`rounded-xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}> 
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Jump back in:</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/projects" className={`p-4 rounded-lg border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} hover:border-blue-400`}>
              <div className="text-lg font-semibold">Browse Projects</div>
              <div className="text-sm opacity-70">Find hands-on projects matched to your goals.</div>
            </Link>
            <Link href="/onboarding/tech" className={`p-4 rounded-lg border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} hover:border-blue-400`}>
              <div className="text-lg font-semibold">Select Tech Stack</div>
              <div className="text-sm opacity-70">Choose what you want to learn.</div>
            </Link>
            <Link href="/onboarding/level" className={`p-4 rounded-lg border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} hover:border-blue-400`}>
              <div className="text-lg font-semibold">Select Level</div>
              <div className="text-sm opacity-70">Tell us your experience.</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


