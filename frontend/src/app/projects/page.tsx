'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Mock data for demonstration
const mockProjects = [
  {
    id: 1,
    title: "Build a Todo App",
    difficulty: "beginner",
    domain: "web-dev",
    description: "Create a full-stack todo application with React and Node.js",
    estimatedHours: 8,
    tags: ["React", "Node.js", "MongoDB"],
    points: 100
  },
  {
    id: 2,
    title: "Weather Dashboard",
    difficulty: "beginner",
    domain: "web-dev",
    description: "Build a weather app using external APIs and modern CSS",
    estimatedHours: 6,
    tags: ["JavaScript", "CSS", "API"],
    points: 80
  },
  {
    id: 3,
    title: "Chat Application",
    difficulty: "intermediate",
    domain: "web-dev",
    description: "Real-time chat app with WebSockets and user authentication",
    estimatedHours: 15,
    tags: ["WebSockets", "Authentication", "Real-time"],
    points: 200
  },
  {
    id: 4,
    title: "Machine Learning Model",
    difficulty: "advanced",
    domain: "ai",
    description: "Train and deploy a machine learning model for image classification",
    estimatedHours: 25,
    tags: ["Python", "TensorFlow", "ML"],
    points: 400
  }
]

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

export default function ProjectsPage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
    }

    // Listen for theme changes
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem('theme')
      setIsDark(currentTheme === 'dark')
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`transition-colors duration-300 ${
        isDark ? 'bg-gray-800 shadow-gray-900' : 'bg-white shadow'
      } shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Learning Projects
              </h1>
              <p className={`${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Choose your next project and start building
              </p>
            </div>
            <Link
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`rounded-lg shadow p-6 mb-8 transition-colors duration-300 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Filter Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className={`border rounded-md px-3 py-2 transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}>
              <option value="">All Domains</option>
              <option value="web-dev">Web Development</option>
              <option value="ai">Artificial Intelligence</option>
              <option value="mobile">Mobile Development</option>
              <option value="data">Data Science</option>
            </select>
            <select className={`border rounded-md px-3 py-2 transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}>
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select className={`border rounded-md px-3 py-2 transition-colors duration-300 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}>
              <option value="">All Time Ranges</option>
              <option value="0-5">0-5 hours</option>
              <option value="5-15">5-15 hours</option>
              <option value="15+">15+ hours</option>
            </select>
            <button className={`font-medium py-2 px-4 rounded-md transition-colors duration-200 ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}>
              Clear Filters
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProjects.map((project) => (
            <div key={project.id} className={`rounded-lg shadow hover:shadow-lg transition-all duration-300 ${
              isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
            }`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isDark 
                      ? darkDifficultyColors[project.difficulty as keyof typeof darkDifficultyColors]
                      : difficultyColors[project.difficulty as keyof typeof difficultyColors]
                  }`}>
                    {project.difficulty}
                  </span>
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {project.estimatedHours}h
                  </span>
                </div>
                
                <h3 className={`text-xl font-semibold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {project.title}
                </h3>
                <p className={`mb-4 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span key={tag} className={`text-xs px-2 py-1 rounded ${
                      isDark 
                        ? 'bg-blue-900 text-blue-200' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {project.points} points
                  </span>
                  <Link
                    href={`/projects/${project.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Start Project
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className={`font-medium py-3 px-6 rounded-lg transition-colors duration-200 ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}>
            Load More Projects
          </button>
        </div>
      </div>
    </div>
  )
}
