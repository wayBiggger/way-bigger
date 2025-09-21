/**
 * Project Grid Component
 * Displays portfolio projects in a responsive grid
 */

'use client';

import React from 'react';
import { PortfolioProject } from '@/types/portfolio';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  projects: PortfolioProject[];
  featured?: boolean;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, featured = false }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 dark:text-slate-500">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg font-medium">
            {featured ? 'No featured projects yet' : 'No projects yet'}
          </p>
          <p className="text-sm mt-2">
            {featured ? 'Projects will appear here when marked as featured' : 'Projects will appear here when completed'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${
      featured 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`}>
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project}
          featured={featured}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
