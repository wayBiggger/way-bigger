'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Mock tracks data
const mockTracks = [
  {
    id: 1,
    name: "Web Development Fundamentals",
    domain: "web-dev",
    description: "Start your journey into web development with HTML, CSS, and JavaScript. Build responsive websites and learn modern frameworks.",
    levels: ["beginner", "intermediate"],
    projectCount: 8,
    estimatedWeeks: 12,
    skills: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    color: "blue"
  },
  {
    id: 2,
    name: "AI & Machine Learning",
    domain: "ai",
    description: "Dive into artificial intelligence and machine learning. Learn Python, data science, and build intelligent applications.",
    levels: ["intermediate", "advanced"],
    projectCount: 6,
    estimatedWeeks: 16,
    skills: ["Python", "TensorFlow", "Pandas", "Scikit-learn", "Deep Learning"],
    color: "purple"
  },
  {
    id: 3,
    name: "Mobile App Development",
    domain: "mobile",
    description: "Create mobile applications for iOS and Android. Learn React Native, Flutter, or native development.",
    levels: ["intermediate", "advanced"],
    projectCount: 5,
    estimatedWeeks: 14,
    skills: ["React Native", "Flutter", "Mobile UI/UX", "App Store", "APIs"],
    color: "green"
  },
  {
    id: 4,
    name: "Data Science & Analytics",
    domain: "data",
    description: "Master data analysis, visualization, and statistical modeling. Work with real datasets and build data-driven solutions.",
    levels: ["beginner", "intermediate", "advanced"],
    projectCount: 7,
    estimatedWeeks: 18,
    skills: ["Python", "SQL", "Statistics", "Data Visualization", "Machine Learning"],
    color: "orange"
  },
  {
    id: 5,
    name: "Cybersecurity",
    domain: "cybersecurity",
    description: "Learn to protect systems, networks, and programs from digital attacks. Understand ethical hacking and security best practices.",
    levels: ["intermediate", "advanced"],
    projectCount: 6,
    estimatedWeeks: 20,
    skills: ["Network Security", "Penetration Testing", "Cryptography", "Forensics", "Security Tools"],
    color: "red"
  },
  {
    id: 6,
    name: "Game Development",
    domain: "game-dev",
    description: "Create engaging games using Unity, Unreal Engine, or web technologies. Learn game design principles and programming.",
    levels: ["beginner", "intermediate", "advanced"],
    projectCount: 9,
    estimatedWeeks: 24,
    skills: ["Unity", "C#", "Game Design", "3D Modeling", "Physics"],
    color: "indigo"
  }
]

const colorClasses = {
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  green: "bg-green-100 text-green-800 border-green-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  red: "bg-red-100 text-red-800 border-red-200",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-200"
}

const darkColorClasses = {
  blue: "bg-blue-900 text-blue-200 border-blue-700",
  purple: "bg-purple-900 text-purple-200 border-purple-700",
  green: "bg-green-900 text-green-200 border-green-700",
  orange: "bg-orange-900 text-orange-200 border-orange-700",
  red: "bg-red-900 text-red-200 border-red-700",
  indigo: "bg-indigo-900 text-indigo-200 border-indigo-700"
}

export default function TracksPage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
    }

    // Listen for theme changes
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem('theme')
      setIsDark(currentTheme === 'dark')
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`transition-colors duration-300 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Choose Your Learning Path
            </h1>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Follow structured learning tracks designed by industry experts. Each track includes 
              carefully curated projects that build upon each other to develop real-world skills.
            </p>
          </div>
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockTracks.map((track) => (
            <div key={track.id} className={`rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`p-6 border-l-4 ${
                isDark 
                  ? darkColorClasses[track.color as keyof typeof darkColorClasses]
                  : colorClasses[track.color as keyof typeof colorClasses]
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {track.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isDark 
                      ? darkColorClasses[track.color as keyof typeof darkColorClasses]
                      : colorClasses[track.color as keyof typeof colorClasses]
                  }`}>
                    {track.domain}
                  </span>
                </div>
                
                <p className={`mb-6 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {track.description}
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Projects:
                    </span>
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {track.projectCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Duration:
                    </span>
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {track.estimatedWeeks} weeks
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Level:
                    </span>
                    <span className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {track.levels.join(' - ')}
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    Skills You'll Learn:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {track.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className={`text-xs px-2 py-1 rounded ${
                        isDark 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {skill}
                      </span>
                    ))}
                    {track.skills.length > 4 && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        isDark 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        +{track.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                
                <Link
                  href={`/tracks/${track.id}`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Start Track
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className={`rounded-lg shadow-lg p-8 transition-colors duration-300 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Not Sure Where to Start?
            </h2>
            <p className={`mb-6 max-w-2xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Take our skill assessment quiz to get personalized recommendations based on your 
              current knowledge and learning goals.
            </p>
            <Link
              href="/assessment"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Take Skill Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
