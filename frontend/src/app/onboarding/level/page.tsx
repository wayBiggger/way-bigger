'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Level = { id: number; level: string; display_name: string; description?: string }

export default function OnboardingLevelPage() {
  const [isDark, setIsDark] = useState(false)
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDark(savedTheme === 'dark')
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          router.replace('/auth/login')
          return
        }
        const fieldId = localStorage.getItem('selected_field_id')
        if (!fieldId) {
          router.replace('/onboarding/tech')
          return
        }
        const res = await fetch(`${API_BASE_URL}/users/onboarding/fields/${fieldId}/proficiency-levels`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load levels')
        const json = await res.json()
        setLevels(json)
      } catch (e: any) {
        setError(e?.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [API_BASE_URL, router])

  const handleSelect = async (level: Level) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.replace('/auth/login')
        return
      }
      const res = await fetch(`${API_BASE_URL}/users/onboarding/select-proficiency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ proficiency_level_id: level.id }),
      })
      if (!res.ok) throw new Error('Failed to save level')
      router.replace('/projects')
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Select your Level</h1>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Choose the level that best matches your current experience.</p>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => handleSelect(lvl)}
              className={`text-left p-5 rounded-xl border transition transform hover:scale-[1.01] hover:shadow ${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
              <div className="text-xl font-semibold mb-2">{lvl.display_name}</div>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>A good fit for learners at the {lvl.display_name.toLowerCase()} stage. Challenging but achievable.</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


