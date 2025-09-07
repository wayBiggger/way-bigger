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
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center text-red-600">{error}</div>
          <div className="text-center mt-4">
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center">Profile not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your account and view your progress
          </p>
        </div>

        {/* Profile Card */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-20 h-20 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center text-2xl font-bold`}>
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
                      className={`text-2xl font-bold bg-transparent border-b-2 ${
                        isDark ? 'border-blue-400 text-white' : 'border-blue-600 text-gray-900'
                      } focus:outline-none`}
                    />
                    <button
                      onClick={handleNameSave}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false)
                        setEditingName(profile.full_name)
                      }}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>@{profile.username}</p>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{profile.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-blue-600">{profile.reputation_score}</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Reputation</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-green-600">{profile.total_points}</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Points</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="text-2xl font-bold text-purple-600">{profile.role}</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Role</div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows={3}
                    className={`w-full p-3 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tech Stack
                    </label>
                    <select
                      value={editForm.selected_field}
                      onChange={(e) => setEditForm({...editForm, selected_field: e.target.value})}
                      className={`w-full p-3 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select tech stack</option>
                      <option value="web-dev">Web Development</option>
                      <option value="ai-ml">AI & Machine Learning</option>
                      <option value="mobile">Mobile Development</option>
                      <option value="data-science">Data Science</option>
                      <option value="cybersecurity">Cybersecurity</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Proficiency Level
                    </label>
                    <select
                      value={editForm.proficiency_level}
                      onChange={(e) => setEditForm({...editForm, proficiency_level: e.target.value})}
                      className={`w-full p-3 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Bio</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {profile.bio || 'No bio added yet.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Tech Stack</h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {profile.selected_field ? profile.selected_field.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Proficiency Level</h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {profile.proficiency_level ? profile.proficiency_level.charAt(0).toUpperCase() + profile.proficiency_level.slice(1) : 'Not selected'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Member Since</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatDate(profile.created_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completed Projects Section */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <h2 className="text-2xl font-bold mb-4">Completed Projects</h2>
          {completedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedProjects.map((project) => (
                <div key={project.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <h3 className="font-semibold mb-2">{project.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.skills_used.map((skill, index) => (
                      <span key={index} className={`px-2 py-1 text-xs rounded ${
                        isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:text-blue-800 text-sm">
                        GitHub
                      </a>
                    )}
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                         className="text-green-600 hover:text-green-800 text-sm">
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="mb-4">No completed projects yet.</p>
              <Link href="/projects" className="text-blue-600 hover:text-blue-800">
                Start your first project →
              </Link>
            </div>
          )}
        </div>

        {/* Dynamic Resume Section */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <h2 className="text-2xl font-bold mb-4">Dynamic Resume</h2>
          
          {/* Skills */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span key={index} className={`px-3 py-1 rounded-full ${
                  isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                }`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Experience</h3>
            <div className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{exp.title}</h4>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {exp.duration}
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {exp.company}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Education</h3>
            <div className="space-y-4">
              {resumeData.education.map((edu, index) => (
                <div key={index} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {edu.year}
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {edu.school}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button className={`px-6 py-2 rounded-lg ${
              isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}>
              Export Resume (PDF)
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/projects" 
              className={`p-4 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 hover:border-blue-500' 
                  : 'bg-gray-50 border-gray-200 hover:border-blue-400'
              }`}
            >
              <div className="text-lg font-semibold">Browse Projects</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Find hands-on projects to build your skills
              </div>
            </Link>
            <Link 
              href="/tracks" 
              className={`p-4 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 hover:border-blue-500' 
                  : 'bg-gray-50 border-gray-200 hover:border-blue-400'
              }`}
            >
              <div className="text-lg font-semibold">Learning Tracks</div>
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Follow structured learning paths
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
