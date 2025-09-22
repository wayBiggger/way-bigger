'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string; ts: number }
type ChatSession = { id: string; title: string; createdAt: number; messages: ChatMessage[] }

const makeId = () => `${Date.now()}_${Math.random().toString(36).slice(2)}`

export default function AIAssistantPage() {
  const pathname = usePathname()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentId, setCurrentId] = useState<string>('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  // Additional AI tools state
  const [activeTool, setActiveTool] = useState<'chat' | 'ideas' | 'path' | 'review' | 'description'>('chat')
  const [ideasField, setIdeasField] = useState('Web Development')
  const [ideasDifficulty, setIdeasDifficulty] = useState('beginner')
  const [ideasInterests, setIdeasInterests] = useState('react, tailwind')
  const [ideasResult, setIdeasResult] = useState<any[] | null>(null)

  const [pathField, setPathField] = useState('Web Development')
  const [pathLevel, setPathLevel] = useState('beginner')
  const [pathGoal, setPathGoal] = useState('Become job-ready in 3 months')
  const [pathResult, setPathResult] = useState<any | null>(null)

  const [reviewCode, setReviewCode] = useState<string>('')
  const [reviewLang, setReviewLang] = useState<string>('typescript')
  const [reviewContext, setReviewContext] = useState<string>('React component performance')
  const [reviewResult, setReviewResult] = useState<any | null>(null)

  const [descTitle, setDescTitle] = useState<string>('AI-powered Task Manager')
  const [descField, setDescField] = useState<string>('Web Development')
  const [descDifficulty, setDescDifficulty] = useState<string>('intermediate')
  const [descResult, setDescResult] = useState<any | null>(null)

  // init session from localStorage (safe & simple)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('ai_sessions_min')
      if (raw) {
        const parsed = JSON.parse(raw) as ChatSession[]
        if (Array.isArray(parsed) && parsed.length) {
          setSessions(parsed)
          setCurrentId(parsed[0].id)
          return
        }
      }
    } catch {}
    const s: ChatSession = { id: makeId(), title: 'New chat', createdAt: Date.now(), messages: [] }
    setSessions([s])
    setCurrentId(s.id)
  }, [])

  // persist
  useEffect(() => {
    try { localStorage.setItem('ai_sessions_min', JSON.stringify(sessions)) } catch {}
  }, [sessions])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [sessions, currentId, loading])

  const current = sessions.find(s => s.id === currentId)

  const newSession = () => {
    const s: ChatSession = { id: makeId(), title: 'New chat', createdAt: Date.now(), messages: [] }
    setSessions(prev => [s, ...prev])
    setCurrentId(s.id)
  }

  const deleteSession = (id: string) => {
    const remaining = sessions.filter(s => s.id !== id)
    if (remaining.length === 0) {
      const s: ChatSession = { id: makeId(), title: 'New chat', createdAt: Date.now(), messages: [] }
      setSessions([s])
      setCurrentId(s.id)
      return
    }
    setSessions(remaining)
    if (currentId === id) {
      setCurrentId(remaining[0].id)
    }
  }

  const send = async () => {
    if (!input.trim() || !current) return
    const user: ChatMessage = { id: makeId(), role: 'user', text: input.trim(), ts: Date.now() }
    setInput('')
    setLoading(true)
    setSessions(prev => prev.map(s => s.id === current.id ? { ...s, title: s.title === 'New chat' ? user.text.slice(0, 40) : s.title, messages: [...s.messages, user] } : s))

    // call backend (with graceful fallback)
    let assistantText = ''
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
      const res = await fetch(`${API_BASE_URL}/ai-assistant/tutor`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: user.text, context: 'chat', user_level: 'intermediate' })
      })
      if (res.ok) {
        const data = await res.json()
        assistantText = data.answer || data.message || data.raw_content || 'Got it.'
      } else {
        assistantText = 'Assistant is temporarily unavailable. Try again later.'
      }
    } catch {
      assistantText = 'Network error. Please try again.'
    }
    const assistant: ChatMessage = { id: makeId(), role: 'assistant', text: assistantText, ts: Date.now() }
    setSessions(prev => prev.map(s => s.id === current.id ? { ...s, messages: [...s.messages, assistant] } : s))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#070815]">
      <Navbar currentPath={pathname} />

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="glass-card p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">Chats</h3>
              <button onClick={newSession} className="px-2 py-1 text-xs rounded bg-pink-600 text-white hover:bg-pink-700">New</button>
            </div>
            <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
              {sessions.map(s => (
                <div key={s.id} className={`px-2 py-2 rounded cursor-pointer group ${s.id === currentId ? 'bg-white/10' : 'hover:bg-white/5'}`} onClick={() => setCurrentId(s.id)}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm text-white">{s.title}</div>
                    <button
                      title="Delete chat"
                      aria-label="Delete chat"
                      onClick={(e) => { e.stopPropagation(); deleteSession(s.id) }}
                      className="rounded p-1 text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M9 3.75A1.5 1.5 0 0 1 10.5 2.25h3A1.5 1.5 0 0 1 15 3.75V4.5h3.75a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1 0-1.5H9V3.75z"/>
                        <path fillRule="evenodd" d="M6.75 7.5h10.5l-.73 11.003A2.25 2.25 0 0 1 14.279 20.75H9.721a2.25 2.25 0 0 1-2.241-2.247L6.75 7.5zm3.75 3.75a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0v-6zm4.5 0a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0v-6z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                  <div className="text-[10px] text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1">
          {/* Horizontal tool tabs aligned with main column */}
          <div className="mb-6">
            <div className="glass-card bg-black/40 border border-white/10">
              <div className="px-3 py-2">
                <div className="flex flex-wrap justify-start gap-2 md:gap-3">
                  <button aria-selected={activeTool==='chat'} onClick={() => setActiveTool('chat')} className={`inline-flex min-w-[140px] justify-center items-center px-4 md:px-5 py-2.5 rounded-full text-sm border transition ${activeTool==='chat'?'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-transparent shadow-lg':'bg-white/5 text-gray-300 hover:text-white border-white/10'}`}>Chat</button>
                  <button aria-selected={activeTool==='ideas'} onClick={() => setActiveTool('ideas')} className={`inline-flex min-w-[140px] justify-center items-center px-4 md:px-5 py-2.5 rounded-full text-sm border transition ${activeTool==='ideas'?'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-transparent shadow-lg':'bg-white/5 text-gray-300 hover:text-white border-white/10'}`}>Project Ideas</button>
                  <button aria-selected={activeTool==='description'} onClick={() => setActiveTool('description')} className={`inline-flex min-w-[140px] justify-center items-center px-4 md:px-5 py-2.5 rounded-full text-sm border transition ${activeTool==='description'?'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-transparent shadow-lg':'bg-white/5 text-gray-300 hover:text-white border-white/10'}`}>Project Description</button>
                  <button aria-selected={activeTool==='path'} onClick={() => setActiveTool('path')} className={`inline-flex min-w-[140px] justify-center items-center px-4 md:px-5 py-2.5 rounded-full text-sm border transition ${activeTool==='path'?'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-transparent shadow-lg':'bg-white/5 text-gray-300 hover:text-white border-white/10'}`}>Learning Path</button>
                  <button aria-selected={activeTool==='review'} onClick={() => setActiveTool('review')} className={`inline-flex min-w-[140px] justify-center items-center px-4 md:px-5 py-2.5 rounded-full text-sm border transition ${activeTool==='review'?'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-transparent shadow-lg':'bg-white/5 text-gray-300 hover:text-white border-white/10'}`}>Code Review</button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Tutor */}
          {activeTool === 'chat' && (
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-black/40 text-white">WayBigger Assistant</div>
              <div className="max-h-[70vh] min-h-[50vh] overflow-y-auto p-6 space-y-4">
                {current?.messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${m.role === 'user' ? 'bg-[#00A884] text-white' : 'bg-white/10 text-gray-100'}`}>{m.text}</div>
                  </div>
                ))}
                {loading && <div className="px-4 py-2 rounded-2xl bg-black/70 text-gray-300 w-fit">Thinking…</div>}
                <div ref={endRef} />
              </div>
              <div className="p-4 border-t border-white/10 bg-black/40">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                    placeholder="Type a message"
                    className="flex-1 p-3 rounded-full bg-[#2A3942] text-white placeholder-gray-300 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A884]"
                  />
                  <button onClick={send} disabled={loading} className={`px-6 py-3 rounded-full font-medium ${loading ? 'bg-gray-600 text-gray-300' : 'bg-[#00A884] text-white hover:bg-[#11b995]'}`}>Send</button>
                </div>
              </div>
            </div>
          )}

          {/* Project Ideas */}
          {activeTool === 'ideas' && (
            <div className="glass-card p-6">
              <div className="text-white font-semibold mb-4">Generate Project Ideas</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <select value={ideasField} onChange={e => setIdeasField(e.target.value)} className="p-3 rounded bg-black/50 border border-white/10 text-white">
                  <option>Web Development</option>
                  <option>AI & Machine Learning</option>
                  <option>Mobile</option>
                  <option>Cybersecurity</option>
                  <option>Data Science</option>
                  <option>Blockchain</option>
                </select>
                <select value={ideasDifficulty} onChange={e => setIdeasDifficulty(e.target.value)} className="p-3 rounded bg-black/50 border border-white/10 text-white">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <input value={ideasInterests} onChange={e => setIdeasInterests(e.target.value)} placeholder="Interests (comma separated)" className="p-3 rounded bg-black/50 border border-white/10 text-white placeholder-gray-400" />
              </div>
              <button
                onClick={async () => {
                  try {
                    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
                    const res = await fetch(`${API_BASE_URL}/ai-assistant/project-ideas`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ field: ideasField, difficulty: ideasDifficulty, user_interests: ideasInterests.split(',').map(s => s.trim()).filter(Boolean) })
                    })
                    const data = await res.json()
                    setIdeasResult(Array.isArray(data) ? data : [])
                  } catch {
                    setIdeasResult([])
                  }
                }}
                className="px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700"
              >Generate Ideas</button>
              <div className="mt-4 space-y-3 max-h-[50vh] overflow-auto">
                {ideasResult?.map((idea, i) => (
                  <div key={i} className="p-4 rounded bg-white/5 text-gray-100">
                    <div className="font-semibold">{idea.title || idea.name || `Idea ${i+1}`}</div>
                    {idea.description && <div className="text-sm text-gray-300 mt-1">{idea.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Description */}
          {activeTool === 'description' && (
            <div className="glass-card p-6">
              <div className="text-white font-semibold mb-4">Generate Project Description</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input value={descTitle} onChange={e => setDescTitle(e.target.value)} placeholder="Project title" className="p-3 rounded bg-black/50 border border-white/10 text-white placeholder-gray-400" />
                <select value={descField} onChange={e => setDescField(e.target.value)} className="p-3 rounded bg-black/50 border border-white/10 text-white">
                  <option>Web Development</option>
                  <option>AI & Machine Learning</option>
                  <option>Mobile</option>
                  <option>Cybersecurity</option>
                  <option>Data Science</option>
                  <option>Blockchain</option>
                </select>
                <select value={descDifficulty} onChange={e => setDescDifficulty(e.target.value)} className="p-3 rounded bg-black/50 border border-white/10 text-white">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <button
                onClick={async () => {
                  try {
                    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
                    const res = await fetch(`${API_BASE_URL}/ai-assistant/project-description`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: descTitle || 'Untitled Project', field: descField, difficulty: descDifficulty })
                    })
                    const data = await res.json()
                    setDescResult(data)
                  } catch {
                    setDescResult({ error: 'Failed to generate' })
                  }
                }}
                className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
              >Generate Description</button>
              {descResult && (
                <div className="mt-4 p-4 rounded bg-white/5 text-gray-100 max-h-[50vh] overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(descResult, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {/* Learning Path */}
          {activeTool === 'path' && (
            <div className="glass-card p-6">
              <div className="text-white font-semibold mb-4">Generate Learning Path</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <select value={pathField} onChange={e => setPathField(e.target.value)} className="p-3 rounded bg-black/50 border border-white/10 text-white">
                  <option>Web Development</option>
                  <option>AI & Machine Learning</option>
                  <option>Mobile</option>
                  <option>Cybersecurity</option>
                  <option>Data Science</option>
                  <option>Blockchain</option>
                </select>
                <select value={pathLevel} onChange={e => setPathLevel(e.target.value)} className="p-3 rounded bg-black/50 border border-white/10 text-white">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <input value={pathGoal} onChange={e => setPathGoal(e.target.value)} placeholder="Your goal" className="p-3 rounded bg-black/50 border border-white/10 text-white placeholder-gray-400" />
              </div>
              <button
                onClick={async () => {
                  try {
                    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
                    const res = await fetch(`${API_BASE_URL}/ai-assistant/learning-path`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ field: pathField, current_skill_level: pathLevel, goal: pathGoal })
                    })
                    const data = await res.json()
                    setPathResult(data)
                  } catch {
                    setPathResult({ error: 'Failed to generate' })
                  }
                }}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >Generate Path</button>
              {pathResult && (
                <div className="mt-4 p-4 rounded bg-white/5 text-gray-100 max-h-[50vh] overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(pathResult, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {/* Code Review */}
          {activeTool === 'review' && (
            <div className="glass-card p-6">
              <div className="text-white font-semibold mb-4">Code Review & Suggestions</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <select value={reviewLang} onChange={e => setReviewLang(e.target.value)} className="p-3 rounded bg-black/50 border border-white/10 text-white">
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
                <input value={reviewContext} onChange={e => setReviewContext(e.target.value)} placeholder="Context (optional)" className="p-3 rounded bg-black/50 border border-white/10 text-white placeholder-gray-400" />
              </div>
              <textarea value={reviewCode} onChange={e => setReviewCode(e.target.value)} placeholder="Paste your code here" className="w-full h-56 p-3 rounded bg-black/50 border border-white/10 text-white placeholder-gray-400"></textarea>
              <div className="mt-3">
                <button
                  onClick={async () => {
                    try {
                      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
                      const res = await fetch(`${API_BASE_URL}/ai-assistant/code-review`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: reviewCode, language: reviewLang, context: reviewContext })
                      })
                      const data = await res.json()
                      setReviewResult(data)
                    } catch {
                      setReviewResult({ error: 'Failed to review code' })
                    }
                  }}
                  className="px-4 py-2 rounded bg-cyan-600 text-white hover:bg-cyan-700"
                >Review Code</button>
              </div>
              {reviewResult && (
                <div className="mt-4 p-4 rounded bg-white/5 text-gray-100 max-h-[50vh] overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(reviewResult, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



