'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Project = {
  id: number
  title: string
  brief: string
  description: string
  difficulty: string
  tags: string[]
  required_skills: string[]
  estimated_hours: number
  max_team_size: number
  is_community: boolean
  created_at: string
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

export default function ProjectsPage() {
  const [isDark, setIsDark] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [userTechStack, setUserTechStack] = useState<string>('')

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api/v1'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDark(savedTheme === 'dark')
  }, [])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError('')
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        
        // Fetch user profile to get tech stack
        if (token) {
          try {
            const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (profileRes.ok) {
              const profileData = await profileRes.json()
              setUserTechStack(profileData.selected_field || '')
            }
          } catch (e) {
            // Silently fail if profile fetch fails
          }
        }

        const res = await fetch(`${API_BASE_URL}/projects`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) throw new Error('Failed to load projects')
        const data = await res.json()
        setProjects(data)
      } catch (e: any) {
        setError(e?.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [API_BASE_URL])

  const filteredProjects = projects.filter(project => {
    const difficultyMatch = selectedDifficulty === 'all' || project.difficulty === selectedDifficulty
    const domainMatch = selectedDomain === 'all' || project.required_skills.some(skill => skill.includes(selectedDomain))
    const searchMatch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.brief.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return difficultyMatch && domainMatch && searchMatch
  })

  // Sort projects: recommended first (matching user tech stack), then by difficulty
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    // Check if projects match user's tech stack
    const aMatchesUserStack = userTechStack && a.required_skills.some(skill => 
      skill.toLowerCase().includes(userTechStack.toLowerCase())
    )
    const bMatchesUserStack = userTechStack && b.required_skills.some(skill => 
      skill.toLowerCase().includes(userTechStack.toLowerCase())
    )
    
    if (aMatchesUserStack && !bMatchesUserStack) return -1
    if (!aMatchesUserStack && bMatchesUserStack) return 1
    
    // Then sort by difficulty (beginner first)
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
    return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
  })

  const domains = [
    { id: 'all', name: 'All Domains' },
    { id: 'web-dev', name: 'Web Development' },
    { id: 'ai-ml', name: 'AI & Machine Learning' },
    { id: 'mobile', name: 'Mobile Development' },
    { id: 'cybersecurity', name: 'Cybersecurity' },
    { id: 'creative', name: 'Creative Industry' }
  ]

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: '🌱 Beginner' },
    { id: 'intermediate', name: '🚀 Intermediate' },
    { id: 'advanced', name: '🔥 Advanced' }
  ]

  const getRecommendedProjects = () => {
    if (!userTechStack) return []
    return sortedProjects.filter(project => 
      project.required_skills.some(skill => 
        skill.toLowerCase().includes(userTechStack.toLowerCase())
      )
    ).slice(0, 3)
  }

  const recommendedProjects = getRecommendedProjects()

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Advanced Projects</h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Build real-world applications and gain hands-on experience with cutting-edge technologies
          </p>
        </div>

        {/* Search Bar */}
        <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full p-3 pl-10 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                Difficulty Level
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={`w-full p-3 border rounded-lg ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.id} value={difficulty.id}>{difficulty.name}</option>
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
                {sortedProjects.length} of {projects.length} projects
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Projects Section */}
        {userTechStack && recommendedProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="mr-2">⭐</span>
              Recommended for {userTechStack.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedProjects.map((project) => (
                <div
                  key={project.id}
                  className={`rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 border-2 border-yellow-400 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDark ? darkDifficultyColors[project.difficulty as keyof typeof darkDifficultyColors] : difficultyColors[project.difficulty as keyof typeof difficultyColors]
                      }`}>
                        {difficultyIcons[project.difficulty as keyof typeof difficultyIcons]} {project.difficulty}
                      </span>
                    </div>
                    
                    <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {project.brief}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                            +{project.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>⏱️ {project.estimated_hours}h</span>
                      <span>👥 Up to {project.max_team_size}</span>
                    </div>
                    
                    <div className="mt-4">
                      <Link
                        href={`/projects/${project.id}`}
                        className={`block w-full text-center py-2 px-4 rounded-md font-medium transition-colors ${
                          isDark
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        }`}
                      >
                        View Project
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading projects...</p>
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
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">All Projects</h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Showing {sortedProjects.length} of {projects.length} projects
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project) => (
                <div
                  key={project.id}
                  className={`rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDark ? darkDifficultyColors[project.difficulty as keyof typeof darkDifficultyColors] : difficultyColors[project.difficulty as keyof typeof difficultyColors]
                      }`}>
                        {difficultyIcons[project.difficulty as keyof typeof difficultyIcons]} {project.difficulty}
                      </span>
                    </div>
                    
                    <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {project.brief}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                            +{project.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>⏱️ {project.estimated_hours}h</span>
                      <span>👥 Up to {project.max_team_size}</span>
                    </div>
                    
                    <div className="mt-4">
                      <Link
                        href={`/projects/${project.id}`}
                        className={`block w-full text-center py-2 px-4 rounded-md font-medium transition-colors ${
                          isDark
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        View Project
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sortedProjects.length === 0 && (
              <div className="text-center py-12">
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  No projects match your current filters. Try adjusting your selection.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
