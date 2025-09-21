'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SmartMentor from '@/components/SmartMentor'
import LearningStyleAssessment from '@/components/LearningStyleAssessment'
import { useMentorship } from '@/hooks/useMentorship'

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
  
  // Mentorship integration
  const userId = 'user-123' // Mock user ID
  const { 
    context: mentorshipContext, 
    learningProfile, 
    interventions,
    chatWithMentor,
    assessLearningStyle 
  } = useMentorship(userId)
  
  const [showMentor, setShowMentor] = useState(false)
  const [showLearningAssessment, setShowLearningAssessment] = useState(false)

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
            <h3 className="text-lg font-semibold text-white">Generated Project Ideas</h3>
            {Array.isArray(result) && result.map((idea: any, index: number) => (
              <div key={index} className="p-4 rounded-lg border border-white/10 bg-white/5" style={{
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
              }}>
                <h4 className="font-medium text-pink-400">{idea.title}</h4>
                {idea.description && <p className="text-sm mt-2 text-gray-300">{idea.description}</p>}
                {idea.learning_objectives && <p className="text-sm mt-1 text-gray-300"><strong className="text-pink-400">Learning:</strong> {idea.learning_objectives}</p>}
                {idea.time_commitment && <p className="text-sm mt-1 text-gray-300"><strong className="text-pink-400">Time:</strong> {idea.time_commitment}</p>}
                {idea.required_skills && <p className="text-sm mt-1 text-gray-300"><strong className="text-pink-400">Skills:</strong> {idea.required_skills}</p>}
                {idea.value && <p className="text-sm mt-1 text-gray-300"><strong className="text-pink-400">Value:</strong> {idea.value}</p>}
              </div>
            ))}
          </div>
        )

      case 'learning-path':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Learning Path</h3>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5" style={{
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
            }}>
              <pre className="whitespace-pre-wrap text-sm text-gray-300">{result.raw_content}</pre>
            </div>
          </div>
        )

      case 'code-review':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Code Review</h3>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5" style={{
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
            }}>
              <p className="text-sm text-gray-300"><strong className="text-pink-400">Language:</strong> {result.language}</p>
              <p className="text-sm mt-2 text-gray-300"><strong className="text-pink-400">Context:</strong> {result.context}</p>
              <div className="mt-4">
                <strong className="text-pink-400">Review:</strong>
                <pre className="whitespace-pre-wrap text-sm mt-2 text-gray-300">{result.review}</pre>
              </div>
            </div>
          </div>
        )

      case 'project-description':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Project Description</h3>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5" style={{
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
            }}>
              <pre className="whitespace-pre-wrap text-sm text-gray-300">{result.raw_content}</pre>
            </div>
          </div>
        )

      case 'tutor':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">AI Tutor Response</h3>
            <div className="p-4 rounded-lg border border-white/10 bg-white/5" style={{
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
            }}>
              <p className="text-sm text-gray-300"><strong className="text-pink-400">Level:</strong> {result.user_level}</p>
              <div className="mt-4">
                <strong className="text-pink-400">Answer:</strong>
                <pre className="whitespace-pre-wrap text-sm mt-2 text-gray-300">{result.answer}</pre>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
      {/* Navigation */}
      <nav className="relative z-20 px-6 py-4 transition-all duration-500" style={{
        borderBottom: '3px solid rgba(255, 0, 128, 0.8)',
        boxShadow: '0 4px 30px rgba(255, 0, 128, 0.4), 0 0 60px rgba(255, 0, 128, 0.3), inset 0 -1px 0 rgba(255, 0, 128, 0.2)'
      }}>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-60"></div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-80"></div>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold text-white">WayBigger</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-white/80 hover:text-pink-400 transition-colors">Home</Link>
            <Link href="/projects" className="text-white/80 hover:text-pink-400 transition-colors">Projects</Link>
            <Link href="/tracks" className="text-white/80 hover:text-pink-400 transition-colors">Tracks</Link>
            <Link href="/community" className="text-white/80 hover:text-pink-400 transition-colors">Community</Link>
            <Link href="/profile" className="text-white/80 hover:text-pink-400 transition-colors">Profile</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="glass-card mx-4 mt-8 mb-8" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <div className="px-6 py-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-white">
              <span className="text-gradient">AI Assistant</span>
            </h1>
            
            {/* AI Status */}
            {aiStatus && (
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-4 ${
                aiStatus.available 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`} style={{
                boxShadow: aiStatus.available 
                  ? '0 0 15px rgba(34, 197, 94, 0.3)'
                  : '0 0 15px rgba(239, 68, 68, 0.3)'
              }}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  aiStatus.available ? 'bg-green-400' : 'bg-red-400'
                }`}></span>
                {aiStatus.status === 'active' ? 'AI Service Active' : 'AI Service Inactive'}
              </div>
            )}
          </div>
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
                  ? 'border-pink-500/50 bg-pink-500/20'
                  : 'border-white/20 hover:border-pink-500/30 bg-white/5 hover:bg-white/10'
              }`}
              style={{
                boxShadow: activeFeature === feature.id
                  ? '0 0 20px rgba(255, 0, 128, 0.3)'
                  : '0 0 15px rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="font-medium text-white">{feature.label}</div>
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
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30 hover:border-pink-400'
            }`}
            style={{
              boxShadow: loading ? 'none' : '0 0 20px rgba(255, 0, 128, 0.3)'
            }}
          >
            {loading ? 'Processing...' : `Generate ${activeFeature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-6" style={{
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)'
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="glass-card p-6" style={{
            boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
          }}>
            {renderResult()}
          </div>
        )}

        {/* Instructions */}
        <div className="glass-card mt-8 p-6" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <h3 className="text-lg font-semibold mb-4 text-white">How to Use</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p><strong className="text-pink-400">Project Ideas:</strong> Get AI-generated project suggestions based on your field and skill level</p>
            <p><strong className="text-pink-400">Learning Path:</strong> Create personalized learning roadmaps for any programming field</p>
            <p><strong className="text-pink-400">Code Review:</strong> Get AI feedback on your code with improvement suggestions</p>
            <p><strong className="text-pink-400">Project Description:</strong> Generate detailed project descriptions and milestones</p>
            <p><strong className="text-pink-400">AI Tutor:</strong> Ask programming questions and get educational responses</p>
          </div>
        </div>
      </div>

      {/* Smart Mentor */}
      <SmartMentor
        userId={userId}
        projectContext={{
          name: 'AI Assistant',
          recent_activity: 'using AI features'
        }}
        isVisible={showMentor}
        onToggle={() => setShowMentor(!showMentor)}
      />

      {/* Learning Style Assessment */}
      {showLearningAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <LearningStyleAssessment
            userId={userId}
            onComplete={(profile) => {
              setShowLearningAssessment(false);
              console.log('Learning style assessed:', profile);
            }}
            onSkip={() => setShowLearningAssessment(false)}
          />
        </div>
      )}

      {/* Mentorship Controls */}
      <div className="fixed top-4 right-4 z-40 flex gap-2">
        {!learningProfile && (
          <button
            onClick={() => setShowLearningAssessment(true)}
            className="px-4 py-2 text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 rounded-lg transition-all duration-300"
            style={{
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
            }}
            title="Take Learning Style Assessment"
          >
            🎓 Assess Learning Style
          </button>
        )}
        
        <button
          onClick={() => setShowMentor(!showMentor)}
          className="px-4 py-2 text-sm bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30 hover:border-pink-400 rounded-lg transition-all duration-300"
          style={{
            boxShadow: '0 0 15px rgba(255, 0, 128, 0.3)'
          }}
          title="Open Smart Mentor"
        >
          🤖 Smart Mentor
          {interventions.length > 0 && (
            <span className="ml-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
          )}
        </button>
      </div>
    </div>
  )
}
