'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

type Track = {
  id: number
  name: string
  domain: string
  description: string
  levels: string[]
  projectCount: number
  estimatedDuration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30"
}

const difficultyIcons = {
  beginner: "🌱",
  intermediate: "🚀",
  advanced: "🔥"
}

export default function TracksPage() {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedDomain, setSelectedDomain] = useState<string>('all')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDark(savedTheme === 'dark')
  }, [])

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true)
        setError('')
        
        const response = await fetch('http://localhost:8000/api/v1/tracks/')
        if (!response.ok) {
          throw new Error(`Failed to fetch tracks: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Tracks loaded:', data)
        
        // Transform API data to match frontend format
        const transformedTracks = data.map((track: any) => ({
          id: track.id,
          name: track.name,
          domain: track.domain,
          description: track.description,
          levels: track.levels || ["Beginner", "Intermediate", "Advanced"],
          projectCount: Math.floor(Math.random() * 30) + 10, // Random count for now
          estimatedDuration: "4-8 months", // Default duration
          difficulty: "intermediate" as const // Default difficulty
        }))
        
        setTracks(transformedTracks)
      } catch (e: any) {
        setError(e?.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchTracks()
  }, [])

  const filteredTracks = tracks.filter(track => {
    const domainMatch = selectedDomain === 'all' || track.domain === selectedDomain
    return domainMatch
  })

  const domains = [
    { id: 'all', name: 'All Domains' },
    { id: 'web-development', name: 'Web Development' },
    { id: 'ai-ml', name: 'AI & Machine Learning' },
    { id: 'mobile', name: 'Mobile Development' },
    { id: 'cybersecurity', name: 'Cybersecurity' },
    { id: 'creative', name: 'Creative Industry' }
  ]

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      {/* Navigation */}
      <Navbar currentPath={pathname} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="glass-card mx-4 mt-8 mb-8" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <div className="px-6 py-8">
            <h1 className="text-4xl font-bold mb-4 text-white">
              Learning <span className="text-gradient">Tracks</span>
            </h1>
            <p className="text-xl text-gray-300">
              Structured learning paths designed to take you from beginner to expert in your chosen field
            </p>
          </div>
        </div>

        {/* Domain Filter */}
        <div className="glass-card mb-8 p-6" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full p-3 border border-pink-500/30 rounded-lg bg-black/50 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400"
                style={{
                  boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)'
                }}
              >
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id} className="bg-black text-white">{domain.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Results
              </label>
              <div className="p-3 rounded-lg bg-black/50 text-gray-300 border border-pink-500/30" style={{
                boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)'
              }}>
                {filteredTracks.length} of {tracks.length} tracks
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto" style={{
              boxShadow: '0 0 20px rgba(255, 0, 128, 0.5)'
            }}></div>
            <p className="mt-4 text-gray-300">Loading tracks...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-400 bg-red-500/20 border border-red-500/30 p-4 rounded-lg" style={{
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
            }}>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.map((track) => (
              <div
                key={track.id}
                className="glass-card overflow-hidden transition-all duration-300 hover:scale-105 hover:border-pink-500/50"
                style={{
                  boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold mb-2 text-white">{track.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[track.difficulty]}`}>
                      {difficultyIcons[track.difficulty]} {track.difficulty}
                    </span>
                  </div>
                  
                  <p className="mb-4 text-gray-300">
                    {track.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {track.levels.map((level, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs bg-pink-500/20 text-pink-400 border border-pink-500/30"
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-4 text-gray-400">
                    <span>📚 {track.projectCount} projects</span>
                    <span>⏱️ {track.estimatedDuration}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/tracks/${track.id}`}
                      className="flex-1 text-center py-2 px-4 rounded-md font-medium transition-all duration-300 bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30 hover:border-pink-400"
                      style={{
                        boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)'
                      }}
                    >
                      View Track
                    </Link>
                    <Link
                      href={`/projects?domain=${track.domain}`}
                      className="flex-1 text-center py-2 px-4 rounded-md font-medium transition-all duration-300 bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30"
                      style={{
                        boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      View Projects
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredTracks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-300">
              No tracks match your current filter. Try adjusting your selection.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}