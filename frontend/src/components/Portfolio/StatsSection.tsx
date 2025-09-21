/**
 * Stats Section Component
 * Displays portfolio statistics and metrics
 */

'use client';

import React from 'react';
import { PortfolioStats } from '@/types/portfolio';

interface StatsSectionProps {
  stats: PortfolioStats;
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatDuration = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  return (
    <div className="space-y-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Projects</p>
              <p className="text-3xl font-bold">{formatNumber(stats.totalProjects)}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold">{formatNumber(stats.completedProjects)}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Hours Spent</p>
              <p className="text-3xl font-bold">{formatNumber(stats.totalHoursSpent)}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Avg Duration</p>
              <p className="text-3xl font-bold">{formatDuration(stats.averageProjectDuration)}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Usage Chart */}
      {stats.mostUsedTechnologies.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Technology Usage
          </h3>
          
          <div className="space-y-4">
            {stats.mostUsedTechnologies.map((tech, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {tech.technology}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {tech.count} projects
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${tech.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Activity */}
      {stats.monthlyActivity.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Monthly Activity
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.monthlyActivity.slice(-4).map((month, index) => (
              <div key={index} className="text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {month.projectsCompleted}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    projects completed
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {formatDuration(month.hoursSpent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Distribution */}
      {stats.skillDistribution.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Skill Distribution
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['beginner', 'intermediate', 'advanced'].map((level) => {
              const skills = stats.skillDistribution.filter(s => s.level === level);
              const color = level === 'beginner' ? 'green' : level === 'intermediate' ? 'yellow' : 'red';
              
              return (
                <div key={level} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {level} ({skills.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {skills.slice(0, 5).map((skill, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">{skill.skill}</span>
                        <span className="text-slate-500 dark:text-slate-400">{skill.projects} projects</span>
                      </div>
                    ))}
                    {skills.length > 5 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        +{skills.length - 5} more skills
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsSection;
