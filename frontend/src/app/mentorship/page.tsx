'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function MentorshipPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('find-mentor');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-4 transition-all duration-500" style={{
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

        <div className="text-center">
          <div className="glass-card p-8 max-w-md mx-4" style={{
            boxShadow: '0 0 30px rgba(255, 0, 128, 0.3)'
          }}>
            <h1 className="text-2xl font-bold text-white mb-4">
              <span className="text-gradient">Please sign in to access mentorship features</span>
            </h1>
            <Link 
              href="/auth/login" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-pink-500/50 hover:border-pink-400"
              style={{
                boxShadow: '0 0 20px rgba(255, 0, 128, 0.3)'
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="glass-card mx-4 mb-8 p-6" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="text-gradient">Mentorship Hub</span>
          </h1>
          <p className="text-gray-300">
            Connect with mentors, share knowledge, and accelerate your learning journey
          </p>
        </div>

        {/* Tabs */}
        <div className="glass-card mx-4 mb-8 p-2" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'find-mentor', name: 'Find Mentor', icon: '🔍' },
              { id: 'my-mentors', name: 'My Mentors', icon: '👥' },
              { id: 'become-mentor', name: 'Become Mentor', icon: '🎓' },
              { id: 'sessions', name: 'Sessions', icon: '📅' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
                style={activeTab === tab.id ? {
                  boxShadow: '0 0 15px rgba(255, 0, 128, 0.3)'
                } : {}}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="glass-card mx-4 p-6" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          {activeTab === 'find-mentor' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                <span className="text-gradient">Find Your Perfect Mentor</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: 'Sarah Johnson',
                    role: 'Senior Full-Stack Developer',
                    company: 'Tech Corp',
                    expertise: ['React', 'Node.js', 'AWS'],
                    rating: 4.9,
                    students: 150
                  },
                  {
                    name: 'Michael Chen',
                    role: 'Lead Data Scientist',
                    company: 'Data Insights',
                    expertise: ['Python', 'Machine Learning', 'TensorFlow'],
                    rating: 4.8,
                    students: 120
                  },
                  {
                    name: 'Emily Rodriguez',
                    role: 'UX/UI Designer',
                    company: 'Design Studio',
                    expertise: ['Figma', 'User Research', 'Prototyping'],
                    rating: 4.9,
                    students: 95
                  }
                ].map((mentor, index) => (
                  <div key={index} className="glass-card p-4 hover:bg-white/5 transition-all" style={{
                    boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                  }}>
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {mentor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-white">{mentor.name}</h3>
                        <p className="text-sm text-gray-300">{mentor.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{mentor.company}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {mentor.expertise.map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded border border-pink-500/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-400">⭐</span>
                        <span className="ml-1 text-sm text-gray-300">{mentor.rating}</span>
                        <span className="ml-2 text-sm text-gray-300">({mentor.students} students)</span>
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded text-sm hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-pink-500/50 hover:border-pink-400" style={{
                        boxShadow: '0 0 15px rgba(255, 0, 128, 0.3)'
                      }}>
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'my-mentors' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                <span className="text-gradient">Your Mentors</span>
              </h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No mentors yet
                </h3>
                <p className="text-gray-300 mb-6">
                  Start connecting with mentors to accelerate your learning journey
                </p>
                <button 
                  onClick={() => setActiveTab('find-mentor')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-pink-500/50 hover:border-pink-400"
                  style={{
                    boxShadow: '0 0 20px rgba(255, 0, 128, 0.3)'
                  }}
                >
                  Find Mentors
                </button>
              </div>
            </div>
          )}

          {activeTab === 'become-mentor' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                <span className="text-gradient">Become a Mentor</span>
              </h2>
              <div className="max-w-2xl">
                <p className="text-gray-300 mb-6">
                  Share your knowledge and help others grow in their careers. As a mentor, you can:
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
                    <span className="text-gray-300">Help students with real-world problems</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
                    <span className="text-gray-300">Build your professional network</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
                    <span className="text-gray-300">Earn recognition and rewards</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
                    <span className="text-gray-300">Improve your teaching skills</span>
                  </li>
                </ul>
                <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 border border-green-500/50 hover:border-green-400" style={{
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
                }}>
                  Apply to Become a Mentor
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                <span className="text-gradient">Mentorship Sessions</span>
              </h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No sessions scheduled
                </h3>
                <p className="text-gray-300 mb-6">
                  Once you connect with mentors, your sessions will appear here
                </p>
                <button 
                  onClick={() => setActiveTab('find-mentor')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-pink-500/50 hover:border-pink-400"
                  style={{
                    boxShadow: '0 0 20px rgba(255, 0, 128, 0.3)'
                  }}
                >
                  Find Mentors
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
