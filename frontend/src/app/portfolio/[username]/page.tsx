/**
 * Public Portfolio Page
 * Displays user's public portfolio at /portfolio/[username]
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PortfolioService from '@/services/portfolioService';
import { PortfolioUser, PortfolioProject, PortfolioStats } from '@/types/portfolio';
import PortfolioHeader from '@/components/Portfolio/PortfolioHeader';
import ProjectGrid from '@/components/Portfolio/ProjectGrid';
import SkillsSection from '@/components/Portfolio/SkillsSection';
import StatsSection from '@/components/Portfolio/StatsSection';
import ContactSection from '@/components/Portfolio/ContactSection';
import LoadingSpinner from '@/components/Portfolio/LoadingSpinner';
import ErrorMessage from '@/components/Portfolio/ErrorMessage';

export default function PublicPortfolioPage() {
  const params = useParams();
  const username = params.username as string;
  
  const [user, setUser] = useState<PortfolioUser | null>(null);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'skills' | 'about'>('projects');

  useEffect(() => {
    loadPortfolioData();
  }, [username]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user profile
      const userData = await PortfolioService.getInstance().getPortfolioUser(username);
      if (!userData) {
        setError('Portfolio not found');
        return;
      }

      // Load projects
      const projectsData = await PortfolioService.getInstance().getPortfolioProjects(username, {
        limit: 20,
        featured: false
      });

      // Load stats
      const statsData = await PortfolioService.getInstance().getPortfolioStats(username);

      setUser(userData);
      setProjects(projectsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
      setError('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !user) {
    return <ErrorMessage message={error || 'Portfolio not found'} />;
  }

  const featuredProjects = projects.filter(p => p.featured);
  const recentProjects = projects.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <PortfolioHeader 
        user={user} 
        stats={stats}
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'projects' && (
          <div className="space-y-12">
            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                  Featured Projects
                </h2>
                <ProjectGrid 
                  projects={featuredProjects} 
                  featured={true}
                />
              </section>
            )}

            {/* All Projects */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                All Projects
              </h2>
              <ProjectGrid 
                projects={recentProjects} 
                featured={false}
              />
            </section>
          </div>
        )}

        {activeTab === 'skills' && (
          <SkillsSection 
            skills={user.skills}
            stats={stats}
          />
        )}

        {activeTab === 'about' && (
          <div className="space-y-12">
            {/* About Section */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                About {user.displayName}
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {user.bio}
                </p>
              </div>
            </section>

            {/* Stats Section */}
            {stats && (
              <StatsSection stats={stats} />
            )}

            {/* Contact Section */}
            <ContactSection user={user} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">
            Portfolio powered by Way Bigger
          </p>
        </div>
      </footer>
    </div>
  );
}
