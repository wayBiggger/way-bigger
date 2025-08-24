'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Mock community data
const mockProjectIdeas = [
  {
    id: 1,
    title: "AI-Powered Study Assistant",
    description: "An intelligent app that helps students create personalized study plans and track their learning progress.",
    author: "Sarah Chen",
    votes: 24,
    status: "open",
    tags: ["AI", "Education", "Mobile App"],
    createdAt: "2 days ago"
  },
  {
    id: 2,
    title: "Sustainable City Planner",
    description: "A web application that helps urban planners design eco-friendly cities with renewable energy integration.",
    author: "Marcus Rodriguez",
    votes: 18,
    status: "in-progress",
    tags: ["Web App", "Sustainability", "Data Visualization"],
    createdAt: "1 week ago"
  },
  {
    id: 3,
    title: "Local Food Network",
    description: "Connect local farmers with consumers through a marketplace app that promotes sustainable food consumption.",
    author: "Emma Thompson",
    votes: 31,
    status: "open",
    tags: ["Mobile App", "E-commerce", "Sustainability"],
    createdAt: "3 days ago"
  }
]

const mockDiscussions = [
  {
    id: 1,
    title: "Best practices for React state management in 2024?",
    author: "Alex Johnson",
    replies: 12,
    views: 156,
    tags: ["React", "State Management", "Frontend"],
    createdAt: "1 day ago"
  },
  {
    id: 2,
    title: "How to get started with machine learning as a beginner?",
    author: "Priya Patel",
    replies: 8,
    views: 89,
    tags: ["Machine Learning", "Beginner", "Python"],
    createdAt: "2 days ago"
  },
  {
    id: 3,
    title: "Tips for building a portfolio that stands out to employers",
    author: "David Kim",
    replies: 15,
    views: 203,
    tags: ["Career", "Portfolio", "Job Search"],
    createdAt: "4 days ago"
  }
]

export default function CommunityPage() {
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
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className={`text-4xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Join Our Community
            </h1>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Connect with fellow learners, share project ideas, and collaborate on exciting new ventures. 
              Together, we can build amazing things and learn from each other.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Ideas Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Project Ideas
                </h2>
                <Link
                  href="/community/submit-idea"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Submit Idea
                </Link>
              </div>
              
              <div className="space-y-4">
                {mockProjectIdeas.map((idea) => (
                  <div key={idea.id} className={`rounded-lg shadow p-6 transition-colors duration-300 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {idea.title}
                        </h3>
                        <p className={`mb-3 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {idea.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            By {idea.author}
                          </span>
                          <span className={`${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {idea.createdAt}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            idea.status === 'open' 
                              ? isDark
                                ? 'bg-green-900 text-green-200'
                                : 'bg-green-100 text-green-800'
                              : isDark
                                ? 'bg-blue-900 text-blue-200'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {idea.status === 'open' ? 'Open for Collaboration' : 'In Progress'}
                          </span>
                        </div>
                      </div>
                      <div className="text-center ml-4">
                        <button className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                          isDark 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                        }`}>
                          <svg className={`w-6 h-6 ${
                            isDark ? 'text-gray-500' : 'text-gray-400'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          <span className={`text-sm font-medium ${
                            isDark ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            {idea.votes}
                          </span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {idea.tags.map((tag) => (
                          <span key={tag} className={`text-xs px-2 py-1 rounded ${
                            isDark 
                              ? 'bg-blue-900 text-blue-200' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/community/ideas/${idea.id}`}
                        className={`font-medium text-sm ${
                          isDark 
                            ? 'text-blue-400 hover:text-blue-300' 
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discussions Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Recent Discussions
                </h2>
                <Link
                  href="/community/discussions"
                  className={`font-medium ${
                    isDark 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  View All →
                </Link>
              </div>
              
              <div className="space-y-4">
                {mockDiscussions.map((discussion) => (
                  <div key={discussion.id} className={`rounded-lg shadow p-6 transition-colors duration-300 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {discussion.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm mb-3">
                      <span className={`${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        By {discussion.author}
                      </span>
                      <span className={`${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {discussion.createdAt}
                      </span>
                      <span className={`${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {discussion.replies} replies
                      </span>
                      <span className={`${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {discussion.views} views
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {discussion.tags.map((tag) => (
                          <span key={tag} className={`text-xs px-2 py-1 rounded ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/community/discussions/${discussion.id}`}
                        className={`font-medium text-sm ${
                          isDark 
                            ? 'text-blue-400 hover:text-blue-300' 
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        Join Discussion →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow p-6 sticky top-8 transition-colors duration-300 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-medium mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Community Stats
              </h3>
              
              <div className="space-y-4">
                <div className={`text-center p-4 rounded-lg ${
                  isDark ? 'bg-blue-900' : 'bg-blue-50'
                }`}>
                  <div className={`text-2xl font-bold ${
                    isDark ? 'text-blue-300' : 'text-blue-600'
                  }`}>
                    1,247
                  </div>
                  <div className={`text-sm ${
                    isDark ? 'text-blue-200' : 'text-blue-800'
                  }`}>
                    Active Learners
                  </div>
                </div>
                
                <div className={`text-center p-4 rounded-lg ${
                  isDark ? 'bg-green-900' : 'bg-green-50'
                }`}>
                  <div className={`text-2xl font-bold ${
                    isDark ? 'text-green-300' : 'text-green-600'
                  }`}>
                    89
                  </div>
                  <div className={`text-sm ${
                    isDark ? 'text-green-200' : 'text-green-800'
                  }`}>
                    Projects Completed
                  </div>
                </div>
                
                <div className={`text-center p-4 rounded-lg ${
                  isDark ? 'bg-purple-900' : 'bg-purple-50'
                }`}>
                  <div className={`text-2xl font-bold ${
                    isDark ? 'text-purple-300' : 'text-purple-600'
                  }`}>
                    156
                  </div>
                  <div className={`text-sm ${
                    isDark ? 'text-purple-200' : 'text-purple-800'
                  }`}>
                    Project Ideas
                  </div>
                </div>
              </div>
              
              <div className={`mt-6 pt-6 border-t transition-colors duration-300 ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h4 className={`text-sm font-medium mb-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <Link
                    href="/community/submit-idea"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Submit Project Idea
                  </Link>
                  <Link
                    href="/community/discussions/new"
                    className={`block w-full text-center font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Start Discussion
                  </Link>
                  <Link
                    href="/community/teams"
                    className={`block w-full text-center font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Find Team Members
                  </Link>
                </div>
              </div>
              
              <div className={`mt-6 pt-6 border-t transition-colors duration-300 ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h4 className={`text-sm font-medium mb-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Join Our Discord
                </h4>
                <p className={`text-sm mb-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Connect with other learners in real-time, get help, and share your progress.
                </p>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  Join Discord Server
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
