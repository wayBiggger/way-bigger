'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    // Toggle body class for global dark mode
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' 
              : 'bg-white hover:bg-gray-50 text-gray-700'
          }`}
        >
          {isDark ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Massive Platform Name */}
            <h1 className={`mb-8 ${
              isDark 
                ? 'text-white' 
                : 'text-gray-900'
            }`}>
              <span className="block text-6xl md:text-8xl lg:text-9xl font-black tracking-tight">
                Way
              </span>
              <span className="block text-6xl md:text-8xl lg:text-9xl font-black tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  Bigger
                </span>
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className={`text-2xl md:text-3xl mb-16 max-w-4xl mx-auto font-light ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Master coding, AI, web development, and more through hands-on projects. 
              Build your portfolio, earn points, and collaborate with other learners.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-12 rounded-2xl text-xl transition-all duration-200 transform hover:scale-105 shadow-2xl"
              >
                Get Started Free
              </Link>
              <Link 
                href="/projects"
                className={`border-4 border-blue-600 font-bold py-6 px-12 rounded-2xl text-xl transition-all duration-200 transform hover:scale-105 ${
                  isDark 
                    ? 'text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-gray-900' 
                    : 'text-blue-600 hover:bg-blue-600 hover:text-white'
                }`}
              >
                Browse Projects
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-32 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Why Learn This Way?
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Traditional learning focuses on theory. We focus on building real projects that matter.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: "💡",
                title: "Skill-Based Learning",
                description: "Choose your field and skill level to get personalized project tracks that match your goals.",
                color: "blue"
              },
              {
                icon: "🚀",
                title: "Progressive Difficulty",
                description: "Start with easier projects and gradually tackle harder ones as you build confidence.",
                color: "green"
              },
              {
                icon: "🤝",
                title: "Collaboration Unlock",
                description: "Earn points to team up with other students on bigger, collaborative projects.",
                color: "purple"
              },
              {
                icon: "🎯",
                title: "Built-in Mentorship",
                description: "Get helpful tips and resources while working, like having a mentor by your side.",
                color: "yellow"
              },
              {
                icon: "📁",
                title: "Portfolio Building",
                description: "Every completed project adds to your public profile, showing exactly what you've built.",
                color: "red"
              },
              {
                icon: "🌱",
                title: "Community Projects",
                description: "Submit your own project ideas and build on proposals from other students.",
                color: "indigo"
              }
            ].map((feature, index) => (
              <div key={index} className={`text-center p-8 rounded-2xl transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-50 hover:bg-white hover:shadow-xl'
              }`}>
                <div className="text-6xl mb-6">{feature.icon}</div>
                <h3 className={`text-2xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-lg ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Build Your Future?
          </h2>
          <p className="text-2xl text-blue-100 mb-10">
            Join thousands of students already learning by building real projects. 
            Start your journey today and unlock your potential.
          </p>
          <Link 
            href="/auth/signup"
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-6 px-12 rounded-2xl text-xl transition-all duration-200 transform hover:scale-105 shadow-2xl inline-block"
          >
            Start Building Now
          </Link>
        </div>
      </div>
    </div>
  )
}
