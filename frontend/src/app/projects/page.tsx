'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { auth, API_BASE_URL } from '@/utils/auth'

type Project = {
  id: number
  title: string
  description: string
  tech_stack: string
  difficulty: string
  outcome: string
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

  // Use Node.js backend for projects
  const NODE_API_BASE_URL = process.env.NEXT_PUBLIC_NODE_API_BASE_URL || 'http://localhost:4000'

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
        
        // Fetch user profile to get tech stack from Python backend
        if (token) {
          try {
            const profileRes = await fetch(`${API_BASE_URL}/auth/profile`, {
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

        // Try to generate AI projects from Node.js backend, fallback to mock data
        try {
          const [beginnerRes, intermediateRes, advancedRes] = await Promise.all([
            fetch(`${NODE_API_BASE_URL}/projects/generate/Beginner`, { method: 'POST' }),
            fetch(`${NODE_API_BASE_URL}/projects/generate/Intermediate`, { method: 'POST' }),
            fetch(`${NODE_API_BASE_URL}/projects/generate/Advanced`, { method: 'POST' })
          ])

          if (beginnerRes.ok && intermediateRes.ok && advancedRes.ok) {
            const [beginnerData, intermediateData, advancedData] = await Promise.all([
              beginnerRes.json(),
              intermediateRes.json(),
              advancedRes.json()
            ])

            // Combine all AI-generated projects and add metadata
            const allProjects = [
              ...beginnerData.projects.map((p: any) => ({ ...p, difficulty: 'beginner', is_community: false, created_at: new Date().toISOString() })),
              ...intermediateData.projects.map((p: any) => ({ ...p, difficulty: 'intermediate', is_community: false, created_at: new Date().toISOString() })),
              ...advancedData.projects.map((p: any) => ({ ...p, difficulty: 'advanced', is_community: false, created_at: new Date().toISOString() }))
            ]

            setProjects(allProjects)
            return
          }
        } catch (e) {
          console.log('API failed, using mock data:', e)
        }

        // Fallback to mock data
        const mockProjects = [
          // Beginner Projects
          {
            id: 1,
            title: "Personal Portfolio Website",
            description: "Build a responsive portfolio website showcasing your projects and skills using HTML, CSS, and JavaScript.",
            tech_stack: "HTML, CSS, JavaScript, React",
            difficulty: "beginner",
            outcome: "A professional portfolio site to showcase your work",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "web-development"
          },
          {
            id: 2,
            title: "Todo List App",
            description: "Create a task management application with add, edit, delete functionality and local storage.",
            tech_stack: "JavaScript, HTML, CSS, Local Storage",
            difficulty: "beginner",
            outcome: "A fully functional todo application",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "web-development"
          },
          {
            id: 3,
            title: "Weather Dashboard",
            description: "Build a weather app that fetches data from a weather API and displays current conditions.",
            tech_stack: "JavaScript, API Integration, CSS",
            difficulty: "beginner",
            outcome: "A real-time weather information dashboard",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "web-development"
          },
          {
            id: 4,
            title: "Simple Calculator",
            description: "Build a basic calculator with arithmetic operations and a clean user interface.",
            tech_stack: "JavaScript, HTML, CSS",
            difficulty: "beginner",
            outcome: "A functional calculator application",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "web-development"
          },
          {
            id: 5,
            title: "Random Quote Generator",
            description: "Create an app that displays random inspirational quotes with a modern design.",
            tech_stack: "JavaScript, HTML, CSS, JSON",
            difficulty: "beginner",
            outcome: "An inspirational quote display app",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "web-development"
          },
          // Intermediate Projects
          {
            id: 6,
            title: "E-commerce Product Catalog",
            description: "Build a product catalog with search, filtering, and shopping cart functionality.",
            tech_stack: "React, Node.js, MongoDB, Express",
            difficulty: "intermediate",
            outcome: "A full-stack e-commerce application",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "web-development"
          },
          {
            id: 7,
            title: "Real-time Chat Application",
            description: "Create a chat app with real-time messaging using WebSockets and user authentication.",
            tech_stack: "Socket.io, Node.js, React, JWT",
            difficulty: "intermediate",
            outcome: "A real-time messaging platform",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "web-development"
          },
          {
            id: 8,
            title: "Machine Learning Model",
            description: "Build a simple machine learning model for data classification using Python and scikit-learn.",
            tech_stack: "Python, scikit-learn, Pandas, NumPy",
            difficulty: "intermediate",
            outcome: "A working ML model with good accuracy",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "ai-ml"
          },
          {
            id: 9,
            title: "Mobile Expense Tracker",
            description: "Create a mobile app to track daily expenses and budgets with data visualization.",
            tech_stack: "React Native, JavaScript, AsyncStorage, Charts",
            difficulty: "intermediate",
            outcome: "A functional mobile expense tracking app",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "mobile"
          },
          {
            id: 10,
            title: "API Integration Dashboard",
            description: "Build a dashboard that integrates multiple APIs and displays data in real-time.",
            tech_stack: "React, REST APIs, Chart.js, Axios",
            difficulty: "intermediate",
            outcome: "A comprehensive data visualization dashboard",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "web-development"
          },
          // Advanced Projects
          {
            id: 11,
            title: "Microservices Architecture",
            description: "Design and implement a microservices architecture with Docker, Kubernetes, and API Gateway.",
            tech_stack: "Docker, Kubernetes, Node.js, PostgreSQL, Redis",
            difficulty: "advanced",
            outcome: "A scalable microservices application",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "web-development"
          },
          {
            id: 12,
            title: "AI-Powered Recommendation System",
            description: "Build a recommendation engine using machine learning algorithms and real user data.",
            tech_stack: "Python, TensorFlow, PostgreSQL, FastAPI",
            difficulty: "advanced",
            outcome: "An intelligent recommendation system",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "ai-ml"
          },
          {
            id: 13,
            title: "Blockchain Voting System",
            description: "Create a secure voting system using blockchain technology and smart contracts.",
            tech_stack: "Solidity, Web3.js, React, Ethereum",
            difficulty: "advanced",
            outcome: "A decentralized voting platform",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "cybersecurity"
          },
          {
            id: 14,
            title: "Real-time Analytics Platform",
            description: "Build a platform for real-time data processing and analytics with streaming capabilities.",
            tech_stack: "Apache Kafka, Apache Spark, Python, React, D3.js",
            difficulty: "advanced",
            outcome: "A high-performance analytics platform",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "ai-ml"
          },
          {
            id: 15,
            title: "Game Development Engine",
            description: "Create a 2D game engine with physics, collision detection, and asset management.",
            tech_stack: "C++, OpenGL, SDL2, Lua",
            difficulty: "advanced",
            outcome: "A custom game development engine",
            is_community: false,
            created_at: new Date().toISOString(),
            domain: "creative"
          }
        ]

        setProjects(mockProjects)
      } catch (e: any) {
        setError(e?.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [NODE_API_BASE_URL])

  const filteredProjects = projects.filter(project => {
    const difficultyMatch = selectedDifficulty === 'all' || project.difficulty.toLowerCase() === selectedDifficulty
    const domainMatch = selectedDomain === 'all' || 
      (project.domain && project.domain.toLowerCase().includes(selectedDomain)) ||
      project.tech_stack.toLowerCase().includes(selectedDomain)
    const searchMatch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tech_stack.toLowerCase().includes(searchQuery.toLowerCase())
    
    return difficultyMatch && domainMatch && searchMatch
  })

  // Sort projects: recommended first (matching user tech stack), then by difficulty
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    // Check if projects match user's tech stack
    const aMatchesUserStack = userTechStack && a.tech_stack.toLowerCase().includes(userTechStack.toLowerCase())
    const bMatchesUserStack = userTechStack && b.tech_stack.toLowerCase().includes(userTechStack.toLowerCase())
    
    if (aMatchesUserStack && !bMatchesUserStack) return -1
    if (!aMatchesUserStack && bMatchesUserStack) return 1
    
    // Then sort by difficulty (beginner first)
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
    return difficultyOrder[a.difficulty.toLowerCase() as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty.toLowerCase() as keyof typeof difficultyOrder]
  })

  const domains = [
    { id: 'all', name: 'All Domains' },
    { id: 'web-development', name: 'Web Development' },
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
      project.tech_stack.toLowerCase().includes(userTechStack.toLowerCase())
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
        <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm transition-all duration-300 animate-fadeIn`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
                Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className={`w-full p-3 border rounded-lg transition-all duration-200 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500' : 'bg-white border-gray-300 hover:border-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                {domains.map(domain => (
                  <option key={domain.id} value={domain.id}>{domain.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
                Difficulty Level
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={`w-full p-3 border rounded-lg transition-all duration-200 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500' : 'bg-white border-gray-300 hover:border-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.id} value={difficulty.id}>{difficulty.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
                Results
              </label>
              <div className={`p-3 rounded-lg transition-all duration-200 ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                <span className="animate-fadeIn">{sortedProjects.length}</span> of <span className="animate-fadeIn">{projects.length}</span> projects
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
                      {project.description}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>⏱️ {project.outcome}</span>
                      <span>👥 Up to {project.outcome}</span>
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
          <div className="space-y-6">
            {/* Loading Header */}
            <div className="animate-pulse">
              <div className={`h-8 bg-gray-300 dark:bg-gray-700 rounded-lg w-64 mb-2`}></div>
              <div className={`h-4 bg-gray-200 dark:bg-gray-600 rounded w-96`}></div>
            </div>
            
            {/* Loading Filters */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm animate-pulse`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className={`h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2`}></div>
                  <div className={`h-10 bg-gray-200 dark:bg-gray-700 rounded`}></div>
                </div>
                <div>
                  <div className={`h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2`}></div>
                  <div className={`h-10 bg-gray-200 dark:bg-gray-700 rounded`}></div>
                </div>
                <div>
                  <div className={`h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2`}></div>
                  <div className={`h-10 bg-gray-200 dark:bg-gray-700 rounded`}></div>
                </div>
              </div>
            </div>

            {/* Loading Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} animate-pulse`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className={`h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2`}></div>
                        <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2`}></div>
                      </div>
                      <div className={`h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full`}></div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-full`}></div>
                      <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6`}></div>
                      <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6`}></div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-20`}></div>
                      <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-16`}></div>
                    </div>
                    
                    <div className={`h-10 bg-gray-300 dark:bg-gray-600 rounded`}></div>
                  </div>
                </div>
              ))}
            </div>
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
              {sortedProjects.map((project, index) => (
                <div
                  key={project.id}
                  className={`rounded-lg shadow-lg overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-xl ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } animate-fadeInUp`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
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
                      {project.description}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>⏱️ {project.outcome}</span>
                      <span>👥 Up to {project.outcome}</span>
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
