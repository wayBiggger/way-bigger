'use client'

import Link from 'next/link'
import { memo } from 'react'

interface Project {
  id: number
  title: string
  description: string
  tech_stack: string
  difficulty: string
  outcome: string
  is_community: boolean
  created_at: string
  tags?: string[]
}

interface ProjectCardProps {
  project: Project
  index: number
}

const difficultyIcons = {
  beginner: "🌱",
  intermediate: "🚀",
  advanced: "🔥"
}

const ProjectCard = memo(function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <div
      key={project.id}
      className="group relative bg-black/90 backdrop-blur-xl rounded-2xl border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 overflow-hidden"
      style={{ 
        animationDelay: `${index * 100}ms`,
        boxShadow: '0 0 40px rgba(255, 0, 128, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Glowing effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Project Header */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors line-clamp-2">
              {project.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                project.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                project.difficulty === 'intermediate' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {difficultyIcons[project.difficulty as keyof typeof difficultyIcons]}
                <span className="ml-1 capitalize">{project.difficulty}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Project Description */}
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">
          {project.description}
        </p>
      </div>

      {/* Tech Stack */}
      <div className="relative px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          {project.tech_stack.split(',').slice(0, 4).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-pink-500/20 text-pink-300 border border-pink-500/30"
            >
              {tag.trim()}
            </span>
          ))}
          {project.tech_stack.split(',').length > 4 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-400 border border-white/20">
              +{project.tech_stack.split(',').length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Project Footer */}
      <div className="relative px-6 py-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-400">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{project.outcome}</span>
          </div>
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 hover:text-pink-200 text-sm font-medium rounded-lg border border-pink-500/30 hover:border-pink-400/50 transition-all duration-200 group-hover:shadow-lg"
            style={{ boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)' }}
          >
            View Project
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
})

export default ProjectCard
