'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock project data
const mockProject = {
  id: 1,
  title: "Build a Todo App",
  difficulty: "beginner",
  domain: "web-dev",
  description: "Create a full-stack todo application with React and Node.js. This project will teach you the fundamentals of modern web development including frontend frameworks, backend APIs, and database management.",
  estimatedHours: 8,
  tags: ["React", "Node.js", "MongoDB", "Express", "JavaScript"],
  points: 100,
  milestones: [
    {
      id: 1,
      title: "Setup Project Structure",
      description: "Initialize your React frontend and Node.js backend projects",
      completed: false,
      estimatedTime: "1 hour"
    },
    {
      id: 2,
      title: "Build Frontend Components",
      description: "Create the main todo components: TodoList, TodoItem, AddTodo",
      completed: false,
      estimatedTime: "2 hours"
    },
    {
      id: 3,
      title: "Implement Backend API",
      description: "Create REST endpoints for CRUD operations on todos",
      completed: false,
      estimatedTime: "2 hours"
    },
    {
      id: 4,
      title: "Connect Frontend to Backend",
      description: "Integrate your React components with the Node.js API",
      completed: false,
      estimatedTime: "2 hours"
    },
    {
      id: 5,
      title: "Add Database Integration",
      description: "Connect your API to MongoDB and implement data persistence",
      completed: false,
      estimatedTime: "1 hour"
    }
  ],
  requirements: [
    "Basic knowledge of JavaScript",
    "Understanding of HTML and CSS",
    "Git for version control",
    "Node.js installed on your machine"
  ],
  learningOutcomes: [
    "Build a complete full-stack application",
    "Understand React component architecture",
    "Learn REST API design principles",
    "Gain experience with MongoDB",
    "Practice modern JavaScript (ES6+)"
  ]
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800"
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [started, setStarted] = useState(false)

  const handleStartProject = () => {
    setStarted(true)
    // TODO: Implement project start logic
    console.log('Starting project:', params.id)
  }

  const handleStartCoding = () => {
    // Redirect to code editor with project context
    window.location.href = `/code-editor?project=${params.id}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/projects" className="text-gray-400 hover:text-gray-500">
                      Projects
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-sm font-medium text-gray-500">{mockProject.title}</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">{mockProject.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[mockProject.difficulty as keyof typeof difficultyColors]}`}>
                {mockProject.difficulty}
              </span>
              <span className="text-sm text-gray-500">{mockProject.estimatedHours}h</span>
              <span className="text-sm text-gray-500">{mockProject.points} points</span>
              {!started ? (
                <button
                  onClick={handleStartProject}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Start Project
                </button>
              ) : (
                <button className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg">
                  In Progress
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'milestones', label: 'Milestones' },
                  { id: 'resources', label: 'Resources' },
                  { id: 'submission', label: 'Code Editor' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{mockProject.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">What You'll Learn</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {mockProject.learningOutcomes.map((outcome, index) => (
                      <li key={index}>{outcome}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Prerequisites</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {mockProject.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'milestones' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Project Milestones</h3>
                {mockProject.milestones.map((milestone) => (
                  <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-md font-medium text-gray-900">{milestone.title}</h4>
                        <p className="text-gray-600 mt-1">{milestone.description}</p>
                        <span className="text-sm text-gray-500 mt-2 inline-block">
                          Estimated time: {milestone.estimatedTime}
                        </span>
                      </div>
                      <div className="ml-4">
                        {milestone.completed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Resources</h3>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Documentation</h4>
                  <ul className="space-y-2">
                    <li>
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        React Official Documentation
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        Node.js Getting Started Guide
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        MongoDB Tutorial
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Video Tutorials</h4>
                  <ul className="space-y-2">
                    <li>
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        React Crash Course
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-blue-600 hover:text-blue-800">
                        Building REST APIs with Node.js
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Community</h4>
                  <p className="text-gray-600">
                    Join our Discord server to get help from mentors and other learners working on similar projects.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'submission' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Integrated Code Editor</h3>
                
                {!started ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">You need to start the project before you can begin coding.</p>
                    <button
                      onClick={handleStartProject}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                      Start Project Now
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="max-w-md mx-auto">
                      <div className="mb-6">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                          <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to Code?</h4>
                        <p className="text-gray-600 mb-6">
                          Click the button below to open our integrated code editor and start building your project directly in the browser.
                        </p>
                      </div>
                      
                      <button
                        onClick={handleStartCoding}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span>Start Coding Now</span>
                      </button>
                      
                      <p className="text-sm text-gray-500 mt-4">
                        Our code editor supports multiple programming languages and provides a complete development environment.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Info</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Difficulty</span>
                  <p className="text-sm text-gray-900">{mockProject.difficulty}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Domain</span>
                  <p className="text-sm text-gray-900">{mockProject.domain}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Estimated Time</span>
                  <p className="text-sm text-gray-900">{mockProject.estimatedHours} hours</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Points</span>
                  <p className="text-sm text-gray-900">{mockProject.points} points</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Tags</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {mockProject.tags.map((tag) => (
                      <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Stuck on a milestone? Get hints and guidance from our AI mentor.
                </p>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200">
                  Get Help
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
