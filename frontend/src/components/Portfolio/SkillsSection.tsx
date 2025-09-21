/**
 * Skills Section Component
 * Displays user skills and technology proficiency
 */

'use client';

import React from 'react';
import { PortfolioStats } from '@/types/portfolio';

interface SkillsSectionProps {
  skills: string[];
  stats: PortfolioStats | null;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, stats }) => {
  const getSkillLevel = (skill: string): 'beginner' | 'intermediate' | 'advanced' => {
    if (!stats) return 'intermediate';
    
    const skillData = stats.skillDistribution.find(s => s.skill.toLowerCase() === skill.toLowerCase());
    return skillData?.level || 'intermediate';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelWidth = (level: string) => {
    switch (level) {
      case 'beginner': return 'w-1/3';
      case 'intermediate': return 'w-2/3';
      case 'advanced': return 'w-full';
      default: return 'w-1/2';
    }
  };

  return (
    <div className="space-y-8">
      {/* Skills Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Technical Skills
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => {
            const level = getSkillLevel(skill);
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {skill}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {level}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getLevelColor(level)} ${getLevelWidth(level)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology Usage Stats */}
      {stats && stats.mostUsedTechnologies.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Most Used Technologies
          </h3>
          
          <div className="space-y-4">
            {stats.mostUsedTechnologies.map((tech, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {tech.technology}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {tech.count} projects ({tech.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${tech.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Frontend Skills */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🎨</span>
            Frontend
          </h4>
          <div className="space-y-2">
            {skills.filter(skill => 
              ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'SASS', 'Tailwind'].some(tech => 
                skill.toLowerCase().includes(tech.toLowerCase())
              )
            ).map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Backend Skills */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">⚙️</span>
            Backend
          </h4>
          <div className="space-y-2">
            {skills.filter(skill => 
              ['Node.js', 'Python', 'Java', 'C#', 'PHP', 'Express', 'Django', 'Flask', 'Spring'].some(tech => 
                skill.toLowerCase().includes(tech.toLowerCase())
              )
            ).map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Database & Tools */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🗄️</span>
            Database & Tools
          </h4>
          <div className="space-y-2">
            {skills.filter(skill => 
              ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'AWS', 'Git', 'Linux'].some(tech => 
                skill.toLowerCase().includes(tech.toLowerCase())
              )
            ).map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;
