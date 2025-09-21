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
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Project Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {project.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                project.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                project.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {difficultyIcons[project.difficulty as keyof typeof difficultyIcons]}
                <span className="ml-1 capitalize">{project.difficulty}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Project Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
          {project.description}
        </p>
      </div>

      {/* Tech Stack */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          {project.tech_stack.split(',').slice(0, 4).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
            >
              {tag.trim()}
            </span>
          ))}
          {project.tech_stack.split(',').length > 4 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{project.tech_stack.split(',').length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Project Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{project.outcome}</span>
          </div>
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 group-hover:shadow-md"
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
