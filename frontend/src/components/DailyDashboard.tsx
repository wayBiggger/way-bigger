'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useGamification } from '@/hooks/useGamification'
import Navbar from '@/components/Navbar'

interface DailyTask {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  dueDate: string
  projectId: string
  projectName: string
  estimatedTime: number
  points: number
}

interface StudyRecommendation {
  id: string
  title: string
  type: 'tutorial' | 'article' | 'video' | 'practice'
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
  url: string
  points: number
}

interface NewsItem {
  id: string
  title: string
  summary: string
  category: 'tech' | 'ai' | 'webdev' | 'career'
  readTime: number
  url: string
  points: number
}

interface ProjectProgress {
  id: string
  name: string
  progress: number
  deadline: string
  tasksCompleted: number
  totalTasks: number
  nextMilestone: string
  teamMembers: number
  status: 'on_track' | 'at_risk' | 'delayed'
}

interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
  status: 'online' | 'offline' | 'busy'
  currentTask: string
  points: number
}

interface LearningPath {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  progress: number
  nextStep: string
  points: number
  category: string
}

interface Goal {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  target: number
  current: number
  deadline: string
  status: 'active' | 'completed' | 'paused'
  points: number
}

interface SocialActivity {
  id: string
  user: string
  avatar: string
  action: string
  details: string
  timestamp: string
  points: number
  type: 'achievement' | 'project' | 'learning' | 'goal'
}

export default function DailyDashboard() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()
  const { progress, badges } = useGamification(user?.id?.toString() || '')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([])
  const [studyRecommendations, setStudyRecommendations] = useState<StudyRecommendation[]>([])
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [projectProgress, setProjectProgress] = useState<ProjectProgress[]>([])
  const [motivationalQuote, setMotivationalQuote] = useState('')
  const [loading, setLoading] = useState(true)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [streakCount, setStreakCount] = useState(0)
  const [achievementUnlocked, setAchievementUnlocked] = useState<string | null>(null)
  const [hoveredTask, setHoveredTask] = useState<string | null>(null)
  const [pulseAnimation, setPulseAnimation] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [socialActivities, setSocialActivities] = useState<SocialActivity[]>([])
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', type: 'daily' as const, target: 1 })

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Load dashboard data
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    try {
      // Simulate API calls - in real app, these would be actual API endpoints
      await Promise.all([
        loadDailyTasks(),
        loadStudyRecommendations(),
        loadNewsItems(),
        loadProjectProgress(),
        loadMotivationalQuote(),
        loadTeamMembers(),
        loadLearningPaths(),
        loadGoals(),
        loadSocialActivities()
      ])
      
      // Psychological: Load user's completed tasks for positive reinforcement
      const savedCompleted = localStorage.getItem('completedTasks')
      if (savedCompleted) {
        setCompletedTasks(JSON.parse(savedCompleted))
      }
      
      // Psychological: Calculate streak for motivation
      const savedStreak = localStorage.getItem('currentStreak')
      setStreakCount(savedStreak ? parseInt(savedStreak) : 0)
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Psychological: Task completion with immediate positive feedback
  const handleTaskComplete = (taskId: string) => {
    if (completedTasks.includes(taskId)) return
    
    setCompletedTasks(prev => [...prev, taskId])
    localStorage.setItem('completedTasks', JSON.stringify([...completedTasks, taskId]))
    
    // Psychological: Immediate celebration effect
    setShowCelebration(true)
    setPulseAnimation(true)
    
    // Check for achievements
    const newCompletedCount = completedTasks.length + 1
    if (newCompletedCount === 1) {
      setAchievementUnlocked("First Task Complete! 🎉")
    } else if (newCompletedCount === 5) {
      setAchievementUnlocked("Task Master! 🏆")
    } else if (newCompletedCount === 10) {
      setAchievementUnlocked("Productivity Legend! ⚡")
    }
    
    // Auto-hide celebration after 3 seconds
    setTimeout(() => {
      setShowCelebration(false)
      setPulseAnimation(false)
      setAchievementUnlocked(null)
    }, 3000)
  }

  // Psychological: Hover effects for better interaction feedback
  const handleTaskHover = (taskId: string | null) => {
    setHoveredTask(taskId)
  }

  const loadDailyTasks = async () => {
    // Mock data - replace with actual API call
    const mockTasks: DailyTask[] = [
      {
        id: '1',
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication to the e-commerce project',
        priority: 'high',
        status: 'in_progress',
        dueDate: '2024-01-15',
        projectId: 'proj-1',
        projectName: 'E-commerce Platform',
        estimatedTime: 4,
        points: 50
      },
      {
        id: '2',
        title: 'Fix responsive design issues',
        description: 'Resolve mobile layout problems on the dashboard',
        priority: 'medium',
        status: 'pending',
        dueDate: '2024-01-16',
        projectId: 'proj-2',
        projectName: 'Portfolio Website',
        estimatedTime: 2,
        points: 30
      },
      {
        id: '3',
        title: 'Write unit tests for API endpoints',
        description: 'Add comprehensive test coverage for user management APIs',
        priority: 'high',
        status: 'overdue',
        dueDate: '2024-01-14',
        projectId: 'proj-1',
        projectName: 'E-commerce Platform',
        estimatedTime: 3,
        points: 40
      },
      {
        id: '4',
        title: 'Code review for team member',
        description: 'Review and provide feedback on pull request #123',
        priority: 'low',
        status: 'completed',
        dueDate: '2024-01-15',
        projectId: 'proj-3',
        projectName: 'Task Management App',
        estimatedTime: 1,
        points: 20
      }
    ]
    setDailyTasks(mockTasks)
  }

  const loadStudyRecommendations = async () => {
    // Mock data - replace with actual API call
    const mockRecommendations: StudyRecommendation[] = [
      {
        id: '1',
        title: 'Advanced React Patterns',
        type: 'tutorial',
        duration: 45,
        difficulty: 'intermediate',
        description: 'Learn about render props, HOCs, and custom hooks',
        url: '/tutorials/react-patterns',
        points: 25
      },
      {
        id: '2',
        title: 'System Design Fundamentals',
        type: 'article',
        duration: 20,
        difficulty: 'advanced',
        description: 'Understanding scalable system architecture',
        url: '/articles/system-design',
        points: 15
      },
      {
        id: '3',
        title: 'JavaScript Algorithms Practice',
        type: 'practice',
        duration: 30,
        difficulty: 'intermediate',
        description: 'Solve coding challenges to improve problem-solving',
        url: '/practice/algorithms',
        points: 20
      }
    ]
    setStudyRecommendations(mockRecommendations)
  }

  const loadNewsItems = async () => {
    // Mock data - replace with actual API call
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'New React 19 Features Announced',
        summary: 'Concurrent rendering improvements and new hooks',
        category: 'tech',
        readTime: 5,
        url: '/news/react-19',
        points: 10
      },
      {
        id: '2',
        title: 'AI Development Tools Update',
        summary: 'Latest tools for AI-assisted coding',
        category: 'ai',
        readTime: 8,
        url: '/news/ai-tools',
        points: 15
      },
      {
        id: '3',
        title: 'Remote Work Best Practices',
        summary: 'Tips for staying productive while working remotely',
        category: 'career',
        readTime: 6,
        url: '/news/remote-work',
        points: 12
      }
    ]
    setNewsItems(mockNews)
  }

  const loadProjectProgress = async () => {
    // Mock data - replace with actual API call
    const mockProjects: ProjectProgress[] = [
      {
        id: '1',
        name: 'E-commerce Platform',
        progress: 75,
        deadline: '2024-01-25',
        tasksCompleted: 15,
        totalTasks: 20,
        nextMilestone: 'Payment Integration',
        teamMembers: 4,
        status: 'on_track'
      },
      {
        id: '2',
        name: 'Portfolio Website',
        progress: 45,
        deadline: '2024-01-30',
        tasksCompleted: 9,
        totalTasks: 20,
        nextMilestone: 'Content Management',
        teamMembers: 2,
        status: 'at_risk'
      },
      {
        id: '3',
        name: 'Task Management App',
        progress: 90,
        deadline: '2024-01-20',
        tasksCompleted: 18,
        totalTasks: 20,
        nextMilestone: 'Final Testing',
        teamMembers: 3,
        status: 'on_track'
      }
    ]
    setProjectProgress(mockProjects)
  }

  const loadMotivationalQuote = async () => {
    const quotes = [
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Code is like humor. When you have to explain it, it's bad. - Cory House",
      "First, solve the problem. Then, write the code. - John Johnson",
      "Experience is the name everyone gives to their mistakes. - Oscar Wilde",
      "The best error message is the one that never shows up. - Thomas Fuchs"
    ]
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }

  const loadTeamMembers = async () => {
    const mockTeam: TeamMember[] = [
      {
        id: '1',
        name: 'Sarah Chen',
        avatar: 'SC',
        role: 'Frontend Lead',
        status: 'online',
        currentTask: 'Implementing user dashboard',
        points: 1250
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        avatar: 'MR',
        role: 'Backend Developer',
        status: 'busy',
        currentTask: 'API optimization',
        points: 980
      },
      {
        id: '3',
        name: 'Alex Kim',
        avatar: 'AK',
        role: 'UI/UX Designer',
        status: 'online',
        currentTask: 'Design system updates',
        points: 1100
      },
      {
        id: '4',
        name: 'Emma Wilson',
        avatar: 'EW',
        role: 'DevOps Engineer',
        status: 'offline',
        currentTask: 'Deployment pipeline',
        points: 890
      }
    ]
    setTeamMembers(mockTeam)
  }

  const loadLearningPaths = async () => {
    const mockPaths: LearningPath[] = [
      {
        id: '1',
        title: 'Full-Stack React Developer',
        description: 'Master React, Node.js, and modern web development',
        difficulty: 'intermediate',
        duration: 120,
        progress: 65,
        nextStep: 'Advanced State Management',
        points: 500,
        category: 'Web Development'
      },
      {
        id: '2',
        title: 'AI & Machine Learning',
        description: 'Learn Python, TensorFlow, and AI fundamentals',
        difficulty: 'advanced',
        duration: 180,
        progress: 30,
        nextStep: 'Neural Networks Basics',
        points: 750,
        category: 'Artificial Intelligence'
      },
      {
        id: '3',
        title: 'Cloud Architecture',
        description: 'AWS, Docker, Kubernetes, and microservices',
        difficulty: 'advanced',
        duration: 150,
        progress: 45,
        nextStep: 'Container Orchestration',
        points: 600,
        category: 'Cloud Computing'
      }
    ]
    setLearningPaths(mockPaths)
  }

  const loadGoals = async () => {
    const mockGoals: Goal[] = [
      {
        id: '1',
        title: 'Complete 5 tasks daily',
        description: 'Maintain consistent daily productivity',
        type: 'daily',
        target: 5,
        current: 3,
        deadline: '2024-01-15',
        status: 'active',
        points: 50
      },
      {
        id: '2',
        title: 'Learn React Hooks',
        description: 'Master all React hooks and patterns',
        type: 'weekly',
        target: 1,
        current: 0,
        deadline: '2024-01-21',
        status: 'active',
        points: 200
      },
      {
        id: '3',
        title: 'Complete 3 projects',
        description: 'Build and deploy 3 full-stack applications',
        type: 'monthly',
        target: 3,
        current: 1,
        deadline: '2024-02-15',
        status: 'active',
        points: 1000
      }
    ]
    setGoals(mockGoals)
  }

  const loadSocialActivities = async () => {
    const mockActivities: SocialActivity[] = [
      {
        id: '1',
        user: 'Sarah Chen',
        avatar: 'SC',
        action: 'completed',
        details: 'E-commerce project milestone',
        timestamp: '2 hours ago',
        points: 100,
        type: 'project'
      },
      {
        id: '2',
        user: 'Mike Rodriguez',
        avatar: 'MR',
        action: 'earned',
        details: 'Code Review Master badge',
        timestamp: '4 hours ago',
        points: 50,
        type: 'achievement'
      },
      {
        id: '3',
        user: 'Alex Kim',
        avatar: 'AK',
        action: 'started',
        details: 'Advanced React Patterns course',
        timestamp: '6 hours ago',
        points: 25,
        type: 'learning'
      },
      {
        id: '4',
        user: 'Emma Wilson',
        avatar: 'EW',
        action: 'achieved',
        details: '30-day coding streak',
        timestamp: '1 day ago',
        points: 200,
        type: 'goal'
      }
    ]
    setSocialActivities(mockActivities)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      case 'pending': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      case 'at_risk': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'delayed': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to WAY BIGGER
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sign in to access your personalized dashboard and start your learning journey!
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const completedTasksCount = dailyTasks.filter(task => task.status === 'completed').length
  const totalTasks = dailyTasks.length
  const overdueTasks = dailyTasks.filter(task => task.status === 'overdue').length
  const totalPoints = dailyTasks.reduce((sum, task) => sum + task.points, 0)
  const earnedPoints = dailyTasks.filter(task => task.status === 'completed').reduce((sum, task) => sum + task.points, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <Navbar currentPath={pathname} />
      
      {/* Header with Psychological Elements */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">
                Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.full_name || user?.username}! 
                <span className="text-2xl ml-2">
                  {currentTime.getHours() < 12 ? '☀️' : currentTime.getHours() < 18 ? '🌤️' : '🌙'}
                </span>
              </h1>
              <p className="text-blue-100 text-lg">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </p>
              {/* Psychological: Personal encouragement */}
              <div className="mt-2 text-sm text-blue-100">
                {completedTasks.length > 0 ? 
                  `You've completed ${completedTasks.length} tasks today! Keep up the great work! 🚀` :
                  "Ready to tackle today's challenges? Let's make it productive! 💪"
                }
              </div>
            </div>
            <div className="text-right text-white">
              {/* Psychological: Animated XP counter with celebration */}
              <div className={`text-3xl font-bold transition-all duration-500 ${pulseAnimation ? 'animate-pulse scale-110' : ''}`}>
                {progress?.total_xp || 0} XP
                {pulseAnimation && <span className="ml-2 text-yellow-300">✨</span>}
              </div>
              <div className="text-sm text-blue-100">
                Level {progress?.level || 1} • {streakCount} day streak 🔥
              </div>
              {/* Psychological: Progress towards next level */}
              <div className="mt-2 w-32 bg-blue-400/30 rounded-full h-2">
                <div 
                  className="bg-yellow-300 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${((progress?.total_xp || 0) % 1000) / 10}%` }}
                ></div>
              </div>
              <div className="text-xs text-blue-100 mt-1">
                {1000 - ((progress?.total_xp || 0) % 1000)} XP to next level
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Psychological: Achievement Notification */}
      {achievementUnlocked && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg border-2 border-yellow-300">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎉</span>
              <span className="font-bold">{achievementUnlocked}</span>
            </div>
          </div>
        </div>
      )}

      {/* Psychological: Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl animate-bounce">
            🎉
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Daily Tasks & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Progress Overview with Psychological Elements */}
            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    Today's Progress 
                    <span className="ml-2 text-lg">
                    {completedTasksCount === totalTasks && totalTasks > 0 ? '🎉' : 
                     completedTasksCount > totalTasks * 0.7 ? '🔥' : 
                     completedTasksCount > 0 ? '💪' : '🚀'}
                    </span>
                  </h2>
                  {/* Psychological: Motivational message based on progress */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {completedTasksCount === totalTasks && totalTasks > 0 ? 
                      "Amazing! You've completed all tasks today! 🏆" :
                      completedTasksCount > totalTasks * 0.7 ? 
                      "You're on fire! Almost there! 🔥" :
                      completedTasksCount > totalTasks * 0.5 ?
                      "Great progress! Keep it up! 💪" :
                      completedTasksCount > 0 ?
                      "Good start! Every task counts! ⭐" :
                      "Ready to make today productive? Let's go! 🚀"
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold transition-all duration-300 ${completedTasksCount > 0 ? 'text-green-600 dark:text-green-400 scale-110' : 'text-gray-400'}`}>
                      {completedTasksCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTasks}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold transition-all duration-300 ${overdueTasks > 0 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-400'}`}>
                      {overdueTasks}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Overdue</div>
                  </div>
                </div>
              </div>
              
              {/* Psychological: Enhanced progress bar with celebration */}
              <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0}%` }}
                  >
                    {/* Psychological: Shimmer effect for completed progress */}
                    {completedTasksCount > 0 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    )}
                  </div>
                </div>
                {/* Psychological: Progress percentage with celebration */}
                <div className="absolute top-0 right-0 text-xs font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow">
                  {Math.round((completedTasksCount / totalTasks) * 100) || 0}%
                </div>
              </div>
              
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {completedTasksCount} of {totalTasks} tasks completed
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {earnedPoints} / {totalPoints} points earned
                </span>
              </div>
              
              {/* Psychological: Encouragement based on completion rate */}
              {completedTasksCount > 0 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎯</span>
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      You're earning {Math.round((earnedPoints / completedTasksCount) || 0)} points per task! 
                      {earnedPoints > totalPoints * 0.5 ? " Keep up the excellent work!" : " Great job!"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Tasks</h2>
                <Link 
                  href="/projects" 
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View All Projects →
                </Link>
              </div>
              <div className="space-y-3">
                {dailyTasks.map((task) => {
                  const isCompleted = completedTasks.includes(task.id)
                  const isHovered = hoveredTask === task.id
                  
                  return (
                    <div 
                      key={task.id}
                      className={`p-4 rounded-lg border-l-4 transition-all duration-300 cursor-pointer transform ${
                        isCompleted ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-500 shadow-lg scale-105' :
                        task.status === 'overdue' ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-500 shadow-lg' :
                        task.status === 'in_progress' ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-500' :
                        isHovered ? 'bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 border-gray-400 shadow-md scale-102' :
                        'bg-gray-50 dark:bg-gray-700 border-gray-300 hover:shadow-md'
                      }`}
                      onMouseEnter={() => handleTaskHover(task.id)}
                      onMouseLeave={() => handleTaskHover(null)}
                      onClick={() => !isCompleted && handleTaskComplete(task.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`font-medium transition-all duration-300 ${
                              isCompleted ? 'line-through text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'
                            }`}>
                              {task.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                              isCompleted ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : getPriorityColor(task.priority)
                            }`}>
                              {task.priority.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                              isCompleted ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : getStatusColor(task.status)
                            }`}>
                              {isCompleted ? 'COMPLETED' : task.status.replace('_', ' ').toUpperCase()}
                            </span>
                            {/* Psychological: Visual reward for completion */}
                            {isCompleted && (
                              <span className="text-green-600 dark:text-green-400 animate-bounce">🎉</span>
                            )}
                          </div>
                          <p className={`text-sm mb-2 transition-all duration-300 ${
                            isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {task.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs">
                            <span className={`transition-all duration-300 ${
                              isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              📁 {task.projectName}
                            </span>
                            <span className={`transition-all duration-300 ${
                              isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              ⏱️ {task.estimatedTime}h
                            </span>
                            <span className={`font-semibold transition-all duration-300 ${
                              isCompleted ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              🎯 {task.points} pts
                            </span>
                            <span className={`transition-all duration-300 ${
                              isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isCompleted ? (
                            <div className="flex items-center space-x-1">
                              <span className="text-green-600 dark:text-green-400 text-xl animate-pulse">✅</span>
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Done!</span>
                            </div>
                          ) : (
                            <button 
                              className={`p-2 rounded-full transition-all duration-300 ${
                                isHovered ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 scale-110' : 
                                'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTaskComplete(task.id)
                              }}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Psychological: Completion celebration */}
                      {isCompleted && (
                        <div className="mt-3 p-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              🎉 Great job! You earned {task.points} points for completing this task!
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Project Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Progress</h2>
                <Link 
                  href="/collaboration" 
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View All Projects →
                </Link>
              </div>
              <div className="space-y-4">
                {projectProgress.map((project) => (
                  <div key={project.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{project.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{project.progress}% complete</span>
                      <span>{project.tasksCompleted}/{project.totalTasks} tasks</span>
                      <span>👥 {project.teamMembers} members</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Next milestone: {project.nextMilestone} • Due: {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Study & News */}
          <div className="space-y-6">
            {/* Study Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Study Today</h2>
                <Link 
                  href="/tracks" 
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {studyRecommendations.map((item) => (
                  <div key={item.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>⏱️ {item.duration}min</span>
                          <span className={`px-2 py-0.5 rounded ${
                            item.difficulty === 'beginner' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                            item.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {item.difficulty}
                          </span>
                          <span>🎯 {item.points} pts</span>
                        </div>
                      </div>
                      <Link 
                        href={item.url}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                      >
                        Start →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* News & Updates */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tech News</h2>
                <Link 
                  href="/letters" 
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {newsItems.map((item) => (
                  <div key={item.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.summary}</p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>📖 {item.readTime}min read</span>
                          <span className={`px-2 py-0.5 rounded ${
                            item.category === 'tech' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                            item.category === 'ai' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                            item.category === 'webdev' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                            'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                          }`}>
                            {item.category}
                          </span>
                          <span>🎯 {item.points} pts</span>
                        </div>
                      </div>
                      <Link 
                        href={item.url}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                      >
                        Read →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Quote with Psychological Elements */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-6xl opacity-20 animate-pulse">✨</div>
              <div className="absolute bottom-0 left-0 text-4xl opacity-20 animate-bounce">💫</div>
              <h3 className="text-lg font-bold mb-2 flex items-center">
                💡 Daily Motivation
                <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded-full">New Daily</span>
              </h3>
              <p className="text-sm italic relative z-10">"{motivationalQuote}"</p>
              <div className="mt-3 text-xs text-blue-100">
                💪 Remember: Every expert was once a beginner!
              </div>
            </div>

            {/* Quick Stats with Psychological Elements */}
            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                📊 Your Achievement Stats
                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                  Live Updates
                </span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔥</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Streak</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{streakCount} days</span>
                    {streakCount > 7 && <span className="text-yellow-500">🏆</span>}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🏆</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Badges Earned</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-yellow-600 dark:text-yellow-400 text-lg">{badges?.length || 0}</span>
                    {badges && badges.length > 5 && <span className="text-yellow-500">⭐</span>}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🚀</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Projects Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">12</span>
                    <span className="text-green-500">🎯</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">⏰</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Time</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">47h 32m</span>
                    <span className="text-purple-500">📚</span>
                  </div>
                </div>
              </div>
              
              {/* Psychological: Achievement encouragement */}
              <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <div className="text-center">
                  <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-1">
                    🎉 You're doing amazing!
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">
                    {streakCount > 7 ? 
                      "You're on fire! Keep up the incredible work!" :
                      streakCount > 3 ?
                      "Great consistency! You're building a strong habit!" :
                      "Every day counts! You're building momentum!"
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Features Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Collaboration */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                👥 Team Collaboration
                <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                  {teamMembers.filter(m => m.status === 'online').length} Online
                </span>
              </h2>
              <Link 
                href="/collaboration" 
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      member.status === 'online' ? 'bg-green-500 text-white' :
                      member.status === 'busy' ? 'bg-yellow-500 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      {member.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      member.status === 'online' ? 'bg-green-400' :
                      member.status === 'busy' ? 'bg-yellow-400' :
                      'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{member.name}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{member.role}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.currentTask}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-blue-600 dark:text-blue-400">🎯 {member.points} pts</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        member.status === 'online' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                        member.status === 'busy' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Paths */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                📚 Learning Paths
                <span className="ml-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                  {learningPaths.length} Active
                </span>
              </h2>
              <Link 
                href="/tracks" 
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {learningPaths.map((path) => (
                <div key={path.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">{path.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{path.description}</p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>⏱️ {path.duration}h</span>
                        <span className={`px-2 py-0.5 rounded ${
                          path.difficulty === 'beginner' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                          path.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {path.difficulty}
                        </span>
                        <span>🎯 {path.points} pts</span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${path.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{path.progress}% complete</span>
                          <span>Next: {path.nextStep}</span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/tracks/${path.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                    >
                      Continue →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goals and Social Activity */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Goals & Objectives */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                🎯 Goals & Objectives
                <span className="ml-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                  {goals.filter(g => g.status === 'active').length} Active
                </span>
              </h2>
              <button 
                onClick={() => setShowGoalModal(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                + Add Goal
              </button>
            </div>
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{goal.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          goal.type === 'daily' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                          goal.type === 'weekly' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                          goal.type === 'monthly' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                          'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                        }`}>
                          {goal.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{goal.description}</p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(goal.current / goal.target) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{goal.current}/{goal.target} completed</span>
                        <span>🎯 {goal.points} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Activity Feed */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                🌟 Team Activity
                <span className="ml-2 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full">
                  Live Feed
                </span>
              </h2>
              <Link 
                href="/community" 
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {socialActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    activity.type === 'achievement' ? 'bg-yellow-500 text-white' :
                    activity.type === 'project' ? 'bg-green-500 text-white' :
                    activity.type === 'learning' ? 'bg-blue-500 text-white' :
                    'bg-purple-500 text-white'
                  }`}>
                    {activity.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{activity.user}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{activity.action}</span> {activity.details}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-blue-600 dark:text-blue-400">🎯 +{activity.points} pts</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        activity.type === 'achievement' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        activity.type === 'project' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                        activity.type === 'learning' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                        'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                      }`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goal Creation Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create New Goal</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter goal title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter goal description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select
                      value={newGoal.type}
                      onChange={(e) => setNewGoal({...newGoal, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
                    <input
                      type="number"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({...newGoal, target: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Add goal logic here
                      setShowGoalModal(false)
                      setNewGoal({ title: '', description: '', type: 'daily', target: 1 })
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Goal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
