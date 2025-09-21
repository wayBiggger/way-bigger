'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useGamification } from '@/hooks/useGamification'
import { useCollaboration } from '@/hooks/useCollaboration'
import { useMentorship } from '@/hooks/useMentorship'

interface IntegratedDashboardProps {
  className?: string
}

export default function IntegratedDashboard({ className = '' }: IntegratedDashboardProps) {
  const { user, isAuthenticated } = useAuth()
  const { progress, badges, loading: gamificationLoading } = useGamification(user?.id?.toString() || '')
  const { projects: activeProjects, loading: collaborationLoading } = useCollaboration(user?.id?.toString() || '')
  const { interventions: sessions, loading: mentorshipLoading } = useMentorship(user?.id?.toString() || '')
  const [featureStatus, setFeatureStatus] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFeatureStatus()
    }
  }, [isAuthenticated, user])

  const loadFeatureStatus = async () => {
    try {
      const response = await fetch('/api/v1/integrated-features/features/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setFeatureStatus(data)
    } catch (error) {
      console.error('Failed to load feature status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={`text-center py-12 ${className}`}>
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
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.full_name || user?.username}!
        </h1>
        <p className="text-blue-100">
          Level {progress?.level || 1} • {progress?.total_xp || 0} XP • {progress?.current_streak || 0} day streak
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Level Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {progress?.level || 1}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((progress?.total_xp || 0) % ((progress?.level || 1) * 1000)) / ((progress?.level || 1) * 1000) * 100}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {((progress?.level || 1) * 1000) - ((progress?.total_xp || 0) % ((progress?.level || 1) * 1000))} XP to next level
            </p>
          </div>
        </div>

        {/* Badges Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Badges Earned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {badges?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/gamification"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all badges →
            </Link>
          </div>
        </div>

        {/* Active Collaborations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeProjects?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/collaboration"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View collaborations →
            </Link>
          </div>
        </div>

        {/* Mentorship Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mentorship</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sessions?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/mentorship"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View sessions →
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Unlock Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Feature Unlock Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(featureStatus.features || {}).map(([feature, status]: [string, any]) => (
            <div 
              key={feature}
              className={`p-4 rounded-lg border-2 ${
                status.unlocked 
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                  : status.can_unlock
                  ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                  {feature.replace('_', ' ')}
                </h4>
                <span className={`text-2xl ${
                  status.unlocked ? 'text-green-600' : status.can_unlock ? 'text-yellow-600' : 'text-gray-400'
                }`}>
                  {status.unlocked ? '✅' : status.can_unlock ? '🔓' : '🔒'}
                </span>
              </div>
              {!status.unlocked && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>Level {status.requirements.level} required</p>
                  <p>{status.requirements.projects_completed} projects needed</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/code-editor"
            className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <span className="text-3xl mb-2">💻</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Code Editor</span>
          </Link>
          
          <Link
            href="/projects"
            className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <span className="text-3xl mb-2">📚</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Browse Projects</span>
          </Link>
          
          <Link
            href="/challenges"
            className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <span className="text-3xl mb-2">🏆</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Industry Challenges</span>
          </Link>
          
          <Link
            href="/portfolio"
            className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <span className="text-3xl mb-2">🎨</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Portfolio</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {/* This would be populated with real activity data */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Earned 50 XP</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed "Hello World" project</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Badge Unlocked</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">First Steps badge earned</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-2xl">👥</span>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Joined Project</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">"E-commerce Website" collaboration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
