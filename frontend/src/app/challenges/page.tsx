'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function ChallengesPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [challenges, setChallenges] = useState([]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to access challenges
          </h1>
          <a 
            href="/auth/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const mockChallenges = {
    active: [
      {
        id: 1,
        title: 'AI Hackathon 2024',
        company: 'TechCorp',
        description: 'Build an AI-powered solution for sustainable energy management',
        prize: '$10,000',
        participants: 150,
        deadline: '2024-12-31',
        difficulty: 'Advanced',
        tags: ['AI', 'Machine Learning', 'Sustainability']
      },
      {
        id: 2,
        title: 'React Native Mobile App',
        company: 'MobileFirst',
        description: 'Create a cross-platform mobile app using React Native',
        prize: '$5,000',
        participants: 89,
        deadline: '2024-11-15',
        difficulty: 'Intermediate',
        tags: ['React Native', 'Mobile', 'JavaScript']
      },
      {
        id: 3,
        title: 'Blockchain DApp',
        company: 'CryptoVentures',
        description: 'Develop a decentralized application on Ethereum',
        prize: '$7,500',
        participants: 67,
        deadline: '2024-10-30',
        difficulty: 'Advanced',
        tags: ['Blockchain', 'Solidity', 'Web3']
      }
    ],
    completed: [
      {
        id: 4,
        title: 'Full-Stack Web App',
        company: 'WebDev Inc',
        description: 'Build a complete web application with frontend and backend',
        prize: '$3,000',
        participants: 200,
        deadline: '2024-09-15',
        difficulty: 'Intermediate',
        tags: ['Full-Stack', 'Node.js', 'React'],
        status: 'Completed',
        position: 3
      }
    ],
    upcoming: [
      {
        id: 5,
        title: 'Data Science Competition',
        company: 'DataCorp',
        description: 'Analyze customer behavior patterns using machine learning',
        prize: '$8,000',
        participants: 0,
        deadline: '2024-12-01',
        difficulty: 'Advanced',
        tags: ['Data Science', 'Python', 'Machine Learning']
      }
    ]
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const currentChallenges = mockChallenges[activeTab as keyof typeof mockChallenges] || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Industry Challenges
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Compete in real-world challenges from top companies and win amazing prizes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Prizes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$25,500</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Participants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">306</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Challenges</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Rank</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">#15</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'active', name: 'Active Challenges', count: 3 },
                { id: 'upcoming', name: 'Upcoming', count: 1 },
                { id: 'completed', name: 'Completed', count: 1 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentChallenges.map((challenge: any) => (
            <div key={challenge.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      by {challenge.company}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {challenge.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {challenge.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="mr-4">💰 {challenge.prize}</span>
                    <span className="mr-4">👥 {challenge.participants}</span>
                    <span>📅 {challenge.deadline}</span>
                  </div>
                </div>

                {challenge.status === 'Completed' && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      🎉 Completed! You finished #{challenge.position} out of {challenge.participants} participants
                    </p>
                  </div>
                )}

                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  {challenge.status === 'Completed' ? 'View Results' : 'Join Challenge'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {currentChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No challenges available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for new exciting challenges!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
