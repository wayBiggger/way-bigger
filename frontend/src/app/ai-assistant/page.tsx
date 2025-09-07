'use client'

import { useState, useEffect } from 'react'

type AIFeature = 'project-ideas' | 'learning-path' | 'code-review' | 'project-description' | 'tutor'

interface TutorResponse {
  message: string
  projects?: any[]
  timestamp: string
}

export default function AIAssistantPage() {
  const [isDark, setIsDark] = useState(false)
  const [activeFeature, setActiveFeature] = useState<AIFeature>('project-ideas')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [aiStatus, setAiStatus] = useState<any>(null)

  // Use Node.js backend for project generation
  const NODE_API_BASE_URL = process.env.NEXT_PUBLIC_NODE_API_BASE_URL || 'http://localhost:4000'
  // Use Python backend for other AI features
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDark(savedTheme === 'dark')
    
    // Check AI service status
    checkAIStatus()
  }, [])

  const checkAIStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-assistant/status`)
      if (response.ok) {
        const status = await response.json()
        setAiStatus(status)
      }
    } catch (e) {
      console.error('Failed to check AI status:', e)
    }
  }

  const handleProjectIdeas = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Use Node.js backend for AI project generation
      const response = await fetch(`${NODE_API_BASE_URL}/projects/generate/Beginner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate project ideas')
      }

      const data = await response.json()
      setResult(data?.projects || data)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleLearningPath = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/ai-assistant/learning-path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: 'web-development',
          current_skill_level: 'beginner',
          goal: 'Build full-stack web applications'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate learning path')
      }

      const data = await response.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeReview = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const sampleCode = `function calculateSum(a, b) {
  return a + b;
}

console.log(calculateSum(5, 3));`

      const response = await fetch(`${API_BASE_URL}/ai-assistant/code-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: sampleCode,
          language: 'JavaScript',
          context: 'Simple addition function'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get code review')
      }

      const data = await response.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleProjectDescription = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/ai-assistant/project-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'E-commerce Platform',
          field: 'web-development',
          difficulty: 'intermediate'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate project description')
      }

      const data = await response.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleTutorQuestion = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/ai-assistant/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'What is the difference between let, const, and var in JavaScript?',
          context: 'Learning JavaScript fundamentals',
          user_level: 'beginner'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get tutor response')
      }

      const data = await response.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const renderResult = () => {
    if (!result) return null

    switch (activeFeature) {
      case 'project-ideas':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generated Project Ideas</h3>
            {Array.isArray(result) && result.map((idea: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                <h4 className="font-medium text-blue-600">{idea.title}</h4>
                {idea.description && <p className="text-sm mt-2">{idea.description}</p>}
                {idea.learning_objectives && <p className="text-sm mt-1"><strong>Learning:</strong> {idea.learning_objectives}</p>}
                {idea.time_commitment && <p className="text-sm mt-1"><strong>Time:</strong> {idea.time_commitment}</p>}
                {idea.required_skills && <p className="text-sm mt-1"><strong>Skills:</strong> {idea.required_skills}</p>}
                {idea.value && <p className="text-sm mt-1"><strong>Value:</strong> {idea.value}</p>}
              </div>
            ))}
          </div>
        )

      case 'learning-path':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Learning Path</h3>
            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
            }`}>
              <pre className="whitespace-pre-wrap text-sm">{result.raw_content}</pre>
            </div>
          </div>
        )

      case 'code-review':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Code Review</h3>
            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
            }`}>
              <p className="text-sm"><strong>Language:</strong> {result.language}</p>
              <p className="text-sm mt-2"><strong>Context:</strong> {result.context}</p>
              <div className="mt-4">
                <strong>Review:</strong>
                <pre className="whitespace-pre-wrap text-sm mt-2">{result.review}</pre>
              </div>
            </div>
          </div>
        )

      case 'project-description':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Description</h3>
            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
            }`}>
              <pre className="whitespace-pre-wrap text-sm">{result.raw_content}</pre>
            </div>
          </div>
        )

      case 'tutor':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Tutor Response</h3>
            <div className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
            }`}>
              <p className="text-sm"><strong>Level:</strong> {result.user_level}</p>
              <div className="mt-4">
                <strong>Answer:</strong>
                <pre className="whitespace-pre-wrap text-sm mt-2">{result.answer}</pre>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🤖 AI Assistant</h1>
          
          {/* AI Status */}
          {aiStatus && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-4 ${
              aiStatus.available 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                aiStatus.available ? 'bg-green-400' : 'bg-red-400'
              }`}></span>
              {aiStatus.status === 'active' ? 'AI Service Active' : 'AI Service Inactive'}
            </div>
          )}
        </div>

        {/* Feature Selection */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { id: 'project-ideas', label: 'Project Ideas', icon: '💡' },
            { id: 'learning-path', label: 'Learning Path', icon: '🛤️' },
            { id: 'code-review', label: 'Code Review', icon: '🔍' },
            { id: 'project-description', label: 'Project Description', icon: '📝' },
            { id: 'tutor', label: 'AI Tutor', icon: '👨‍🏫' }
          ].map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id as AIFeature)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                activeFeature === feature.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : isDark 
                    ? 'border-gray-600 hover:border-gray-500' 
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="font-medium">{feature.label}</div>
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => {
              switch (activeFeature) {
                case 'project-ideas': handleProjectIdeas(); break
                case 'learning-path': handleLearningPath(); break
                case 'code-review': handleCodeReview(); break
                case 'project-description': handleProjectDescription(); break
                case 'tutor': handleTutorQuestion(); break
              }
            }}
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-medium transition-colors duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Processing...' : `Generate ${activeFeature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={`p-6 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            {renderResult()}
          </div>
        )}

        {/* Instructions */}
        <div className={`mt-8 p-6 rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}>
          <h3 className="text-lg font-semibold mb-4">How to Use</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Project Ideas:</strong> Get AI-generated project suggestions based on your field and skill level</p>
            <p><strong>Learning Path:</strong> Create personalized learning roadmaps for any programming field</p>
            <p><strong>Code Review:</strong> Get AI feedback on your code with improvement suggestions</p>
            <p><strong>Project Description:</strong> Generate detailed project descriptions and milestones</p>
            <p><strong>AI Tutor:</strong> Ask programming questions and get educational responses</p>
          </div>
        </div>
      </div>
    </div>
  )
}
