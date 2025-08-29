'use client'

import { useEffect, useState } from 'react'

type Field = { id: number; name: string; display_name: string }

export default function AILetterPage() {
  const [isDark, setIsDark] = useState(false)
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [contentPreview, setContentPreview] = useState<string>('')

  const [form, setForm] = useState({
    field_id: '',
    topic: '',
    tone: 'informative',
    length: 'medium',
    include_examples: true,
  })

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDark(savedTheme === 'dark')
  }, [])

  useEffect(() => {
    // Load fields for selection from onboarding endpoint
    const fetchFields = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/onboarding/fields`)
        if (!res.ok) throw new Error('Failed to load fields')
        const json = await res.json()
        setFields(json)
      } catch (e: any) {
        // Ignore loudly, user can still type field id
      }
    }
    fetchFields()
  }, [API_BASE_URL])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setContentPreview('')
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      const res = await fetch(`${API_BASE_URL}/newsletters/ai-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          field_id: Number(form.field_id),
          topic: form.topic || undefined,
          tone: form.tone,
          length: form.length,
          include_examples: form.include_examples,
        }),
      })
      if (!res.ok) throw new Error('Failed to generate AI letter')
      const json = await res.json()
      setSuccess('AI letter generated! You can copy or post it as a draft.')
      setContentPreview(`# ${json.title}\n\n${json.content}`)
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Generate AI Letter</h1>
        <form onSubmit={handleGenerate} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow space-y-4`}>
          <div>
            <label className="block text-sm mb-1">Field</label>
            <select
              name="field_id"
              value={form.field_id}
              onChange={handleChange}
              required
              className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded p-2 w-full`}
            >
              <option value="" disabled>Select a field</option>
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.display_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Topic (optional)</label>
            <input
              type="text"
              name="topic"
              value={form.topic}
              onChange={handleChange}
              placeholder="e.g., Latest trends in Machine Learning"
              className={`${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded p-2 w-full`}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1">Tone</label>
              <select name="tone" value={form.tone} onChange={handleChange} className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded p-2 w-full`}>
                <option value="informative">Informative</option>
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Length</label>
              <select name="length" value={form.length} onChange={handleChange} className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded p-2 w-full`}>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-6 sm:mt-0">
              <input id="include_examples" type="checkbox" name="include_examples" checked={form.include_examples} onChange={handleChange} />
              <label htmlFor="include_examples" className="text-sm">Include examples</label>
            </div>
          </div>

          <div className="flex gap-2">
            <button disabled={loading} type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">{loading ? 'Generating...' : 'Generate'}</button>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
        </form>

        {contentPreview && (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow mt-6`}>
            <h2 className="text-lg font-semibold mb-2">Preview</h2>
            <pre className={`${isDark ? 'bg-gray-900' : 'bg-gray-100'} p-3 rounded overflow-auto text-sm`}>
{contentPreview}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}


