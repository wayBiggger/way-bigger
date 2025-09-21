'use client'

import Link from 'next/link'
import { useState, useEffect, memo, useMemo, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import OptimizedLoading from '@/components/OptimizedLoading'
import ProjectCard from '@/components/ProjectCard'
import Navbar from '@/components/Navbar'
import './projects.css'

type Project = {
  id: number
  title: string
  description: string
  tech_stack: string
  difficulty: string
  outcome: string
  is_community: boolean
  created_at: string
  tags?: string[]
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
  const pathname = usePathname()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
        const response = await fetch(`${API_BASE_URL}/projects`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [])

  // Memoized filter and sort functions for better performance
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
    const difficultyMatch = selectedDifficulty === 'all' || project.difficulty.toLowerCase() === selectedDifficulty
    
    // Domain filtering based on industry in description
    const domainMatch = selectedDomain === 'all' || 
        (project.description && project.description.toLowerCase().includes(`in the ${selectedDomain} industry`))
    
    const searchMatch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.tech_stack && project.tech_stack.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return difficultyMatch && domainMatch && searchMatch
  })
  }, [projects, selectedDifficulty, selectedDomain, searchQuery])

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
    return difficultyOrder[a.difficulty.toLowerCase() as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty.toLowerCase() as keyof typeof difficultyOrder]
  })
  }, [filteredProjects])

  // Memoized event handlers
  const handleDomainChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDomain(e.target.value)
  }, [])

  const handleDifficultyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDifficulty(e.target.value)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const domains = [
    { id: 'all', name: 'All Domains' },
    { id: 'agriculture', name: '🌾 Agriculture' },
    { id: 'ecommerce', name: '🛒 E-commerce' },
    { id: 'education', name: '🎓 Education' },
    { id: 'environment', name: '🌱 Environment' },
    { id: 'finance', name: '💰 Finance' },
    { id: 'healthcare', name: '🏥 Healthcare' },
    { id: 'manufacturing', name: '🏭 Manufacturing' },
    { id: 'transportation', name: '🚗 Transportation' }
  ]

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: '🌱 Beginner' },
    { id: 'intermediate', name: '🚀 Intermediate' },
    { id: 'advanced', name: '🔥 Advanced' }
  ]

  return (
    <div className="min-h-screen relative" style={{background: 'var(--bg-primary)'}}>
      {/* Navigation Bar */}
      <Navbar currentPath={pathname} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Explore <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Build real-world applications and gain hands-on experience with cutting-edge technologies. 
            Choose from {sortedProjects.length} carefully curated projects across different domains and difficulty levels.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="glass-card p-8 text-center hover:glass-hover transition-all duration-300" style={{
            boxShadow: '0 0 20px rgba(255, 0, 128, 0.2)'
          }}>
            <div className="text-4xl font-bold text-pink-400 mb-2">
              {loading ? '...' : sortedProjects.length}
            </div>
            <div className="text-gray-300 font-medium">
              {selectedDomain === 'all' && selectedDifficulty === 'all' && searchQuery === '' 
                ? 'Total Projects' 
                : 'Filtered Results'
              }
            </div>
          </div>
          <div className="glass-card p-8 text-center hover:glass-hover transition-all duration-300" style={{
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
          }}>
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {loading ? '...' : sortedProjects.filter(p => p.difficulty === 'beginner').length}
            </div>
            <div className="text-gray-300 font-medium">Beginner Friendly</div>
          </div>
          <div className="glass-card p-8 text-center hover:glass-hover transition-all duration-300" style={{
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)'
          }}>
            <div className="text-4xl font-bold text-cyan-400 mb-2">
              {loading ? '...' : sortedProjects.filter(p => p.difficulty === 'advanced').length}
            </div>
            <div className="text-gray-300 font-medium">Advanced Projects</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="glass-card p-8 mb-12" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <h3 className="text-xl font-semibold text-white mb-6">Filter Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Domain Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                Domain
                </span>
              </label>
              <select
                value={selectedDomain}
                onChange={handleDomainChange}
                className="w-full p-3 bg-black/50 border border-pink-500/30 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-400 transition-all duration-200 backdrop-blur-sm"
                style={{ boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)' }}
              >
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id} className="bg-black text-white">
                    {domain.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                Difficulty Level
                </span>
              </label>
              <select
                value={selectedDifficulty}
                onChange={handleDifficultyChange}
                className="w-full p-3 bg-black/50 border border-green-500/30 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-400 transition-all duration-200 backdrop-blur-sm"
                style={{ boxShadow: '0 0 15px rgba(34, 197, 94, 0.1)' }}
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.id} value={difficulty.id} className="bg-black text-white">
                    {difficulty.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Projects
                </span>
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by title, description, or tech stack..."
                className="w-full p-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-200 backdrop-blur-sm"
                style={{ boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)' }}
              />
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-6 pb-4">
                  <OptimizedLoading size="md" text="Loading project..." />
                  </div>
                </div>
              ))}
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}

        {!loading && sortedProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Available</h3>
              <p className="text-gray-600">Check back later for new projects to explore.</p>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Building?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of developers who are already building amazing projects
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Started Free
              </Link>
                      <Link
                href="/community"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Join Community
                      </Link>
                    </div>
                  </div>
                </div>
      </div>
    </div>
  )
}
