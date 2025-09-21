'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type UserProfile = {
  id: number
  email: string
  username: string
  full_name: string
  role: string
  bio: string | null
  avatar_url: string | null
  reputation_score: number
  total_points: number
  onboarding_completed: boolean
  selected_field: string | null
  proficiency_level: string | null
  created_at: string
}

type Project = {
  id: number
  title: string
  description: string
  difficulty: string
  status: string
  completed_at: string
  skills_used: string[]
  github_url?: string
  live_url?: string
}

export default function ProfilePage() {
  const [isDark, setIsDark] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editForm, setEditForm] = useState({
    bio: '',
    selected_field: '',
    proficiency_level: ''
  })
  const [editingName, setEditingName] = useState('')
  const [completedProjects, setCompletedProjects] = useState<Project[]>([])
  const [resumeData, setResumeData] = useState({
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    experience: [
      {
        title: 'Full Stack Developer',
        company: 'Tech Startup',
        duration: '2023 - Present',
        description: 'Built scalable web applications using modern technologies'
      }
    ],
    education: [
      {
        degree: 'Computer Science',
        school: 'University of Technology',
        year: '2023'
      }
    ]
  })

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    setIsDark(savedTheme === 'dark')
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError('')
        const token = localStorage.getItem('access_token')
        if (!token) {
          setError('Please log in to view your profile')
          return
        }

        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        
        if (!res.ok) throw new Error('Failed to load profile')
        const data = await res.json()
        setProfile(data)
        setEditForm({
          bio: data.bio || '',
          selected_field: data.selected_field || '',
          proficiency_level: data.proficiency_level || ''
        })
        setEditingName(data.full_name)
      } catch (e: any) {
        setError(e?.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [API_BASE_URL])

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editForm)
      })

      if (!res.ok) throw new Error('Failed to update profile')
      
      // Refresh profile data
      const updatedProfile = await res.json()
      setProfile(updatedProfile)
      setIsEditing(false)
    } catch (e: any) {
      setError(e?.message || 'Failed to update profile')
    }
  }

  const handleNameSave = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ full_name: editingName })
      })

      if (!res.ok) throw new Error('Failed to update name')
      
      // Update local state
      if (profile) {
        setProfile({ ...profile, full_name: editingName })
      }
      setIsEditingName(false)
    } catch (e: any) {
      setError(e?.message || 'Failed to update name')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center text-white">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center text-red-400">{error}</div>
          <div className="text-center mt-4">
            <Link href="/auth/login" className="text-pink-400 hover:text-pink-300">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen" style={{background: 'var(--bg-primary)'}}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center text-white">Profile not found</div>
        </div>
      </div>
    )
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
            <Link href="/profile" className="text-pink-400 font-medium">Profile</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="glass-card mx-4 mt-8 mb-8" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <div className="px-6 py-8">
            <h1 className="text-4xl font-bold mb-2 text-white">
              <span className="text-gradient">Profile</span>
            </h1>
            <p className="text-xl text-gray-300">
              Manage your account and view your progress
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-6 mb-6" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full" />
                ) : (
                  profile.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                {isEditingName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="text-2xl font-bold bg-transparent border-b-2 border-pink-400 text-white focus:outline-none focus:border-pink-300"
                    />
                    <button
                      onClick={handleNameSave}
                      className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-sm hover:bg-green-500/30"
                      style={{
                        boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)'
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false)
                        setEditingName(profile.full_name)
                      }}
                      className="px-3 py-1 bg-white/10 text-white border border-white/20 rounded text-sm hover:bg-white/20"
                      style={{
                        boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold text-white">{profile.full_name}</h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-gray-400 hover:text-pink-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className="text-gray-300">@{profile.username}</p>
                <p className="text-gray-400 text-sm">{profile.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30 hover:border-pink-400 transition-all duration-300"
              style={{
                boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)'
              }}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10" style={{
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
            }}>
              <div className="text-2xl font-bold text-pink-400">{profile.reputation_score}</div>
              <div className="text-sm text-gray-300">Reputation</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10" style={{
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
            }}>
              <div className="text-2xl font-bold text-green-400">{profile.total_points}</div>
              <div className="text-sm text-gray-300">Total Points</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10" style={{
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
            }}>
              <div className="text-2xl font-bold text-purple-400">{profile.role}</div>
              <div className="text-sm text-gray-300">Role</div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows={3}
                    className="w-full p-3 rounded-lg border border-pink-500/30 bg-black/50 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400"
                    style={{
                      boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)'
                    }}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Tech Stack
                    </label>
                    <select
                      value={editForm.selected_field}
                      onChange={(e) => setEditForm({...editForm, selected_field: e.target.value})}
                      className="w-full p-3 rounded-lg border border-pink-500/30 bg-black/50 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400"
                      style={{
                        boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)'
                      }}
                    >
                      <option value="" className="bg-black text-white">Select tech stack</option>
                      <option value="web-dev" className="bg-black text-white">Web Development</option>
                      <option value="ai-ml" className="bg-black text-white">AI & Machine Learning</option>
                      <option value="mobile" className="bg-black text-white">Mobile Development</option>
                      <option value="data-science" className="bg-black text-white">Data Science</option>
                      <option value="cybersecurity" className="bg-black text-white">Cybersecurity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Proficiency Level
                    </label>
                    <select
                      value={editForm.proficiency_level}
                      onChange={(e) => setEditForm({...editForm, proficiency_level: e.target.value})}
                      className="w-full p-3 rounded-lg border border-pink-500/30 bg-black/50 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-400"
                      style={{
                        boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)'
                      }}
                    >
                      <option value="" className="bg-black text-white">Select level</option>
                      <option value="beginner" className="bg-black text-white">Beginner</option>
                      <option value="intermediate" className="bg-black text-white">Intermediate</option>
                      <option value="advanced" className="bg-black text-white">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:border-green-400 rounded-lg transition-all duration-300"
                    style={{
                      boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 rounded-lg transition-all duration-300"
                    style={{
                      boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Bio</h3>
                  <p className="text-gray-300">
                    {profile.bio || 'No bio added yet.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Tech Stack</h3>
                    <p className="text-gray-300">
                      {profile.selected_field ? profile.selected_field.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Proficiency Level</h3>
                    <p className="text-gray-300">
                      {profile.proficiency_level ? profile.proficiency_level.charAt(0).toUpperCase() + profile.proficiency_level.slice(1) : 'Not selected'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Member Since</h3>
                  <p className="text-gray-300">
                    {formatDate(profile.created_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completed Projects Section */}
        <div className="glass-card p-6 mb-6" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <h2 className="text-2xl font-bold mb-4 text-white">Completed Projects</h2>
          {completedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedProjects.map((project) => (
                <div key={project.id} className="bg-white/5 border border-white/10 rounded-lg p-4" style={{
                  boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 className="font-semibold mb-2 text-white">{project.title}</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.skills_used.map((skill, index) => (
                      <span key={index} className="px-2 py-1 text-xs rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" 
                         className="text-pink-400 hover:text-pink-300 text-sm transition-colors">
                        GitHub
                      </a>
                    )}
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                         className="text-green-400 hover:text-green-300 text-sm transition-colors">
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-4">No completed projects yet.</p>
              <Link href="/projects" className="text-pink-400 hover:text-pink-300 transition-colors">
                Start your first project →
              </Link>
            </div>
          )}
        </div>

        {/* Dynamic Resume Section */}
        <div className="glass-card p-6 mb-6" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <h2 className="text-2xl font-bold mb-4 text-white">Dynamic Resume</h2>
          
          {/* Skills */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-white">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-white">Experience</h3>
            <div className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4" style={{
                  boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white">{exp.title}</h4>
                    <span className="text-sm text-gray-400">
                      {exp.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    {exp.company}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-white">Education</h3>
            <div className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4" style={{
                  boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white">{edu.degree}</h4>
                    <span className="text-sm text-gray-400">
                      {edu.year}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    {edu.school}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button className="px-6 py-2 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30 hover:bg-pink-500/30 hover:border-pink-400 transition-all duration-300" style={{
              boxShadow: '0 0 15px rgba(255, 0, 128, 0.3)'
            }}>
              Export Resume (PDF)
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <h3 className="text-xl font-semibold mb-4 text-white">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/projects" 
              className="p-4 rounded-lg border border-white/10 bg-white/5 hover:border-pink-500/50 hover:bg-white/10 transition-all duration-300"
              style={{
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="text-lg font-semibold text-white">Browse Projects</div>
              <div className="text-sm text-gray-300">
                Find hands-on projects to build your skills
              </div>
            </Link>
            <Link 
              href="/tracks" 
              className="p-4 rounded-lg border border-white/10 bg-white/5 hover:border-pink-500/50 hover:bg-white/10 transition-all duration-300"
              style={{
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="text-lg font-semibold text-white">Learning Tracks</div>
              <div className="text-sm text-gray-300">
                Follow structured learning paths
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
