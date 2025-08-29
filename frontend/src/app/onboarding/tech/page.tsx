'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Field = { id: number; name: string; display_name: string; description?: string }

export default function OnboardingTechPage() {
  const [isDark, setIsDark] = useState(false)
  const [fields, setFields] = useState<Field[]>([])
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
        const res = await fetch(`${API_BASE_URL}/users/onboarding/fields`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load tech stacks')
        const json = await res.json()
        setFields(json)
      } catch (e: any) {
        setError(e?.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [API_BASE_URL, router])

  const handleSelect = async (field: Field) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.replace('/auth/login')
        return
      }
      const res = await fetch(`${API_BASE_URL}/users/onboarding/select-field`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ field_id: field.id }),
      })
      if (!res.ok) throw new Error('Failed to save selection')
      // Persist for next step
      localStorage.setItem('selected_field_id', String(field.id))
      localStorage.setItem('selected_field_name', field.name)
      router.push('/onboarding/level')
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Choose your Tech Stack</h1>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Pick the primary field you want to learn by building.</p>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {fields.map((f) => (
            <button
              key={f.id}
              onClick={() => handleSelect(f)}
              className={`text-left p-5 rounded-xl border transition transform hover:scale-[1.01] hover:shadow ${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'}`}
            >
              <div className="text-xl font-semibold mb-2">{f.display_name}</div>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Learn {f.display_name} with real, hands-on projects tailored to your goals.</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


