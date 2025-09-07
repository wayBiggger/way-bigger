'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800"
}

const darkDifficultyColors = {
  beginner: "bg-green-900 text-green-200",
  intermediate: "bg-yellow-900 text-yellow-200",
  advanced: "bg-red-900 text-red-200"
}

const difficultyIcons = {
  beginner: "🌱",
  intermediate: "🚀",
  advanced: "🔥"
}

export default function TracksPage() {
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
        
        // Mock tracks data - in a real app, this would come from an API
        const mockTracks = [
          {
            id: 1,
            name: "Full-Stack Web Development",
            domain: "web-development",
            description: "Master modern web development with React, Node.js, and databases. Build complete web applications from frontend to backend.",
            levels: ["Beginner", "Intermediate", "Advanced"],
            projectCount: 25,
            estimatedDuration: "6-8 months",
            difficulty: "beginner" as const
          },
          {
            id: 2,
            name: "AI & Machine Learning",
            domain: "ai-ml",
            description: "Dive into artificial intelligence, machine learning, and data science. Learn Python, TensorFlow, and build intelligent applications.",
            levels: ["Beginner", "Intermediate", "Advanced"],
            projectCount: 20,
            estimatedDuration: "8-10 months",
            difficulty: "intermediate" as const
          },
          {
            id: 3,
            name: "Mobile App Development",
            domain: "mobile",
            description: "Create mobile applications for iOS and Android using React Native, Flutter, and native development.",
            levels: ["Beginner", "Intermediate", "Advanced"],
            projectCount: 18,
            estimatedDuration: "5-7 months",
            difficulty: "intermediate" as const
          },
          {
            id: 4,
            name: "Cybersecurity & Ethical Hacking",
            domain: "cybersecurity",
            description: "Learn cybersecurity fundamentals, penetration testing, and ethical hacking techniques to protect systems.",
            levels: ["Beginner", "Intermediate", "Advanced"],
            projectCount: 15,
            estimatedDuration: "6-9 months",
            difficulty: "advanced" as const
          },
          {
            id: 5,
            name: "Game Development & Creative Coding",
            domain: "creative",
            description: "Create games, interactive art, and creative applications using Unity, Unreal Engine, and creative coding tools.",
            levels: ["Beginner", "Intermediate", "Advanced"],
            projectCount: 22,
            estimatedDuration: "7-9 months",
            difficulty: "intermediate" as const
          },
          {
            id: 6,
            name: "DevOps & Cloud Engineering",
            domain: "web-development",
            description: "Master cloud platforms, containerization, CI/CD, and infrastructure as code for scalable applications.",
            levels: ["Intermediate", "Advanced"],
            projectCount: 12,
            estimatedDuration: "4-6 months",
            difficulty: "advanced" as const
          }
        ]

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setTracks(mockTracks)
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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Learning Tracks</h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Structured learning paths designed to take you from beginner to expert in your chosen field
          </p>
        </div>

        {/* Domain Filter */}
        <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className={`w-full p-3 border rounded-lg ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Results
              </label>
              <div className={`p-3 rounded-lg ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                {filteredTracks.length} of {tracks.length} tracks
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading tracks...</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.map((track) => (
              <div
                key={track.id}
                className={`rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold mb-2">{track.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isDark ? darkDifficultyColors[track.difficulty] : difficultyColors[track.difficulty]
                    }`}>
                      {difficultyIcons[track.difficulty]} {track.difficulty}
                    </span>
                  </div>
                  
                  <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {track.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {track.levels.map((level, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs ${
                            isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`flex items-center justify-between text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>📚 {track.projectCount} projects</span>
                    <span>⏱️ {track.estimatedDuration}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/tracks/${track.id}`}
                      className={`flex-1 text-center py-2 px-4 rounded-md font-medium transition-colors ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      View Track
                    </Link>
                    <Link
                      href={`/projects?domain=${track.domain}`}
                      className={`flex-1 text-center py-2 px-4 rounded-md font-medium transition-colors ${
                        isDark
                          ? 'bg-gray-600 hover:bg-gray-700 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
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
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              No tracks match your current filter. Try adjusting your selection.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}