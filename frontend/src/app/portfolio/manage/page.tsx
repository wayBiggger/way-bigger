/**
 * Portfolio Management Page
 * Allows users to manage their portfolio projects and settings
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortfolioService from '@/services/portfolioService';
import PDFGenerator from '@/services/pdfGenerator';
import { PortfolioProject, PortfolioUser, ResumeData } from '@/types/portfolio';
import ProjectCard from '@/components/Portfolio/ProjectCard';
import LoadingSpinner from '@/components/Portfolio/LoadingSpinner';
import ErrorMessage from '@/components/Portfolio/ErrorMessage';

export default function PortfolioManagePage() {
  const router = useRouter();
  const [user, setUser] = useState<PortfolioUser | null>(null);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'settings' | 'export'>('projects');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user ID (in a real app, this would come from auth context)
      const userId = localStorage.getItem('userId') || 'current-user';
      
      const [userData, projectsData] = await Promise.all([
        PortfolioService.getInstance().getPortfolioUser(userId),
        PortfolioService.getInstance().getPortfolioProjects(userId, { limit: 50 })
      ]);

      setUser(userData);
      setProjects(projectsData);
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResume = async () => {
    if (!user) return;

    try {
      setIsGeneratingPDF(true);
      
      const resumeData = await PortfolioService.getInstance().generateResumeData(user.id, {
        includePersonalInfo: true,
        includeContactInfo: true,
        includeSkills: true,
        includeExperience: true,
        includeEducation: true,
        includeCertifications: true,
        includeAchievements: true,
        includeSocialLinks: true,
        projectLimit: 10,
        featuredOnly: false
      });

      const pdfBlob = await PDFGenerator.getInstance().generateResumePDF(resumeData, {
        format: 'A4',
        orientation: 'portrait',
        theme: 'modern'
      });

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${user.displayName}-Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate resume:', err);
      setError('Failed to generate resume');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGeneratePortfolio = async () => {
    if (!user) return;

    try {
      setIsGeneratingPDF(true);
      
      const selectedProjectsData = projects.filter(p => selectedProjects.includes(p.id));
      
      const pdfBlob = await PDFGenerator.getInstance().generatePortfolioPDF(
        selectedProjectsData.length > 0 ? selectedProjectsData : projects,
        user,
        {
          format: 'pdf',
          includeProjects: true,
          includeContactInfo: true,
          includeSkills: true,
          includeExperience: true,
          includeEducation: true,
          customSections: [],
          styling: {
            font: 'Arial',
            fontSize: 12,
            colorScheme: 'modern',
            layout: 'grid'
          }
        }
      );

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${user.displayName}-Portfolio.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate portfolio:', err);
      setError('Failed to generate portfolio');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGenerateLinkedInPost = async (project: PortfolioProject) => {
    try {
      const linkedInPost = await PortfolioService.getInstance().generateLinkedInPost(project.id);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(linkedInPost.content);
      alert('LinkedIn post copied to clipboard!');
    } catch (err) {
      console.error('Failed to generate LinkedIn post:', err);
      setError('Failed to generate LinkedIn post');
    }
  };

  const handleGenerateGitHubReadme = async (project: PortfolioProject) => {
    try {
      const readme = PDFGenerator.getInstance().generateGitHubReadme(project);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(readme);
      alert('GitHub README copied to clipboard!');
    } catch (err) {
      console.error('Failed to generate GitHub README:', err);
      setError('Failed to generate GitHub README');
    }
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !user) {
    return <ErrorMessage message={error || 'Failed to load portfolio'} onRetry={loadPortfolioData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Portfolio Management
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Manage your projects and generate professional documents
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => router.push(`/portfolio/${user.username}`)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                View Public Portfolio
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="mt-6">
            <div className="flex space-x-8">
              {[
                { id: 'projects', label: 'Projects', count: projects.length },
                { id: 'settings', label: 'Settings', count: 0 },
                { id: 'export', label: 'Export', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Project Actions */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Your Projects
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/code-editor')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Create New Project
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="relative">
                  <ProjectCard project={project} featured={project.featured} />
                  
                  {/* Project Actions */}
                  <div className="absolute top-2 left-2 flex space-x-2">
                    <button
                      onClick={() => toggleProjectSelection(project.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        selectedProjects.includes(project.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700'
                      }`}
                      title="Select for export"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Action Menu */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => handleGenerateLinkedInPost(project)}
                      className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      title="Generate LinkedIn Post"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleGenerateGitHubReadme(project)}
                      className="p-1.5 bg-slate-600 text-white rounded-full hover:bg-slate-700 transition-colors"
                      title="Generate GitHub README"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Export Portfolio
            </h2>

            {/* Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resume Export */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Generate Resume
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Create a professional PDF resume with your projects and experience.
                </p>
                <button
                  onClick={handleGenerateResume}
                  disabled={isGeneratingPDF}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isGeneratingPDF ? 'Generating...' : 'Generate Resume PDF'}
                </button>
              </div>

              {/* Portfolio Export */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Generate Portfolio
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Create a comprehensive PDF portfolio with selected projects.
                </p>
                <div className="mb-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    Selected projects: {selectedProjects.length} of {projects.length}
                  </p>
                  {selectedProjects.length === 0 && (
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      No projects selected. All projects will be included.
                    </p>
                  )}
                </div>
                <button
                  onClick={handleGeneratePortfolio}
                  disabled={isGeneratingPDF}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isGeneratingPDF ? 'Generating...' : 'Generate Portfolio PDF'}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedProjects(projects.map(p => p.id))}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Select All Projects
                </button>
                <button
                  onClick={() => setSelectedProjects([])}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  onClick={() => setSelectedProjects(projects.filter(p => p.featured).map(p => p.id))}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Select Featured Only
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Portfolio Settings
            </h2>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
              <p className="text-slate-600 dark:text-slate-300">
                Portfolio settings will be available in a future update.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
