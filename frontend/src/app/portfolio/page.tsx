'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function PortfolioPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('my-portfolio');

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
              <span className="text-gradient">Please sign in to access portfolio features</span>
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

  const mockPortfolio = {
    username: 'johndoe',
    fullName: 'John Doe',
    title: 'Full-Stack Developer',
    bio: 'Passionate developer with 3+ years of experience building web applications',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    stats: {
      projects: 12,
      skills: 8,
      experience: '3+ years',
      rating: 4.8
    },
    projects: [
      {
        id: 1,
        title: 'E-Commerce Platform',
        description: 'Full-stack e-commerce solution with React and Node.js',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        featured: true
      },
      {
        id: 2,
        title: 'Task Management App',
        description: 'Collaborative task management with real-time updates',
        image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
        technologies: ['Vue.js', 'Express', 'Socket.io', 'PostgreSQL'],
        featured: true
      },
      {
        id: 3,
        title: 'Weather Dashboard',
        description: 'Real-time weather tracking with beautiful visualizations',
        image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=300&fit=crop',
        technologies: ['JavaScript', 'Chart.js', 'OpenWeather API'],
        featured: false
      }
    ],
    skills: [
      { name: 'JavaScript', level: 90 },
      { name: 'React', level: 85 },
      { name: 'Node.js', level: 80 },
      { name: 'Python', level: 75 },
      { name: 'TypeScript', level: 70 },
      { name: 'MongoDB', level: 65 }
    ]
  };

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
            <span className="text-gradient">Portfolio Hub</span>
          </h1>
          <p className="text-gray-300">
            Showcase your work, build your professional presence, and connect with opportunities
          </p>
        </div>

        {/* Tabs */}
        <div className="glass-card mx-4 mb-8 p-2" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'my-portfolio', name: 'My Portfolio', icon: '👤' },
              { id: 'discover', name: 'Discover', icon: '🔍' },
              { id: 'templates', name: 'Templates', icon: '🎨' },
              { id: 'analytics', name: 'Analytics', icon: '📊' }
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
        {activeTab === 'my-portfolio' && (
          <div className="space-y-8">
            {/* Portfolio Preview */}
            <div className="glass-card mx-4 p-6" style={{
              boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
            }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  <span className="text-gradient">Portfolio Preview</span>
                </h2>
                <div className="flex space-x-3">
                  <Link 
                    href="/portfolio/manage"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-pink-500/50 hover:border-pink-400"
                    style={{
                      boxShadow: '0 0 15px rgba(255, 0, 128, 0.3)'
                    }}
                  >
                    Manage Portfolio
                  </Link>
                  <Link 
                    href={`/portfolio/${mockPortfolio.username}`}
                    className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
                    style={{
                      boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    View Public
                  </Link>
                </div>
              </div>

              {/* Portfolio Header */}
              <div className="flex items-center mb-6">
                <img 
                  src={mockPortfolio.avatar} 
                  alt={mockPortfolio.fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-pink-500/30"
                />
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-white">
                    {mockPortfolio.fullName}
                  </h3>
                  <p className="text-gray-300">{mockPortfolio.title}</p>
                  <p className="text-sm text-gray-400">{mockPortfolio.bio}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center glass-card p-4" style={{
                  boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                }}>
                  <div className="text-2xl font-bold text-blue-400">
                    {mockPortfolio.stats.projects}
                  </div>
                  <div className="text-sm text-gray-300">Projects</div>
                </div>
                <div className="text-center glass-card p-4" style={{
                  boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                }}>
                  <div className="text-2xl font-bold text-green-400">
                    {mockPortfolio.stats.skills}
                  </div>
                  <div className="text-sm text-gray-300">Skills</div>
                </div>
                <div className="text-center glass-card p-4" style={{
                  boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                }}>
                  <div className="text-2xl font-bold text-purple-400">
                    {mockPortfolio.stats.experience}
                  </div>
                  <div className="text-sm text-gray-300">Experience</div>
                </div>
                <div className="text-center glass-card p-4" style={{
                  boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                }}>
                  <div className="text-2xl font-bold text-yellow-400">
                    {mockPortfolio.stats.rating}
                  </div>
                  <div className="text-sm text-gray-300">Rating</div>
                </div>
              </div>

              {/* Featured Projects */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  <span className="text-gradient">Featured Projects</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockPortfolio.projects.filter(p => p.featured).map((project) => (
                    <div key={project.id} className="glass-card overflow-hidden hover:bg-white/5 transition-all" style={{
                      boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                    }}>
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <h5 className="font-semibold text-white mb-2">
                          {project.title}
                        </h5>
                        <p className="text-sm text-gray-300 mb-3">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech, index) => (
                            <span key={index} className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded border border-pink-500/30">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'discover' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Discover Amazing Portfolios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: 'Sarah Johnson',
                  title: 'UI/UX Designer',
                  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                  projects: 15,
                  rating: 4.9
                },
                {
                  name: 'Mike Chen',
                  title: 'Full-Stack Developer',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                  projects: 22,
                  rating: 4.8
                },
                {
                  name: 'Emily Rodriguez',
                  title: 'Data Scientist',
                  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                  projects: 18,
                  rating: 4.9
                }
              ].map((person, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <img 
                      src={person.avatar} 
                      alt={person.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{person.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{person.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {person.projects} projects
                    </span>
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">{person.rating}</span>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    View Portfolio
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Portfolio Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Modern Developer', category: 'Developer', color: 'blue' },
                { name: 'Creative Designer', category: 'Designer', color: 'purple' },
                { name: 'Data Scientist', category: 'Data Science', color: 'green' },
                { name: 'Minimalist', category: 'General', color: 'gray' },
                { name: 'Tech Startup', category: 'Entrepreneur', color: 'orange' },
                { name: 'Academic', category: 'Student', color: 'indigo' }
              ].map((template, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className={`h-32 bg-${template.color}-500`}></div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.category}
                    </p>
                    <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Portfolio Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,234</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">89</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Unique Visitors</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Contact Inquiries</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">4.8</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Portfolio viewed by Sarah Johnson</span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">New project added: E-Commerce Platform</span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">1 day ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Contact inquiry received</span>
                  <span className="text-sm text-gray-500 dark:text-gray-500">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
