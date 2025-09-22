'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

type Track = {
  id: number;
  name: string;
  domain: string;
  description: string;
  levels: string[];
  ordering: any[];
  is_active: boolean;
  created_at: string;
};

type Project = {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  tech_stack: string;
  tags: string[];
  estimated_hours: number;
  max_team_size: number;
  is_community: boolean;
};

interface TrackPageProps {
  params: {
    id: string;
  };
}

const difficultyColors = {
  beginner: "bg-green-900 text-green-200 border-green-500/30",
  intermediate: "bg-yellow-900 text-yellow-200 border-yellow-500/30",
  advanced: "bg-red-900 text-red-200 border-red-500/30"
};

const difficultyIcons = {
  beginner: "🌱",
  intermediate: "🚀",
  advanced: "🔥"
};

export default function TrackPage({ params }: TrackPageProps) {
  const pathname = usePathname();
  const [track, setTrack] = useState<Track | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    const fetchTrackData = async () => {
      try {
        setLoading(true);
        
        // Fetch track details
        const trackResponse = await fetch(`http://localhost:8000/api/v1/tracks/${params.id}`);
        if (!trackResponse.ok) {
          throw new Error(`Track not found: ${trackResponse.status}`);
        }
        const trackData = await trackResponse.json();
        setTrack(trackData);

        // Fetch projects for this track
        const projectsResponse = await fetch(`http://localhost:8000/api/v1/projects/?domain=${trackData.domain}`);
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(Array.isArray(projectsData) ? projectsData : []);
        }
      } catch (error: any) {
        console.error('Error fetching track:', error);
        setError(error.message || 'Failed to load track');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackData();
  }, [params.id]);

  const filteredProjects = projects.filter(project => {
    if (selectedDifficulty === 'all') return true;
    return project.difficulty.toLowerCase() === selectedDifficulty;
  });

  const getDifficultyClass = (difficulty: string) => {
    const lowerDifficulty = difficulty.toLowerCase();
    return difficultyColors[lowerDifficulty as keyof typeof difficultyColors] || "bg-gray-700 text-gray-200 border-gray-500/30";
  };

  const getDifficultyIcon = (difficulty: string) => {
    const lowerDifficulty = difficulty.toLowerCase();
    return difficultyIcons[lowerDifficulty as keyof typeof difficultyIcons] || "✨";
  };

  if (loading) {
    return (
      <div className="min-h-screen relative" style={{background: 'var(--bg-primary)'}}>
        <Navbar currentPath={pathname} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-300">Loading track...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative" style={{background: 'var(--bg-primary)'}}>
        <Navbar currentPath={pathname} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-white mb-4">Track Not Found</h1>
            <p className="text-xl text-gray-300 mb-8">{error}</p>
            <Link href="/tracks" className="btn-outline text-lg px-8 py-3 rounded-lg border-pink-500/50 hover:border-pink-400 transition-all duration-300">
              ← Back to Tracks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen relative" style={{background: 'var(--bg-primary)'}}>
        <Navbar currentPath={pathname} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-white mb-4">Track Not Found</h1>
            <p className="text-xl text-gray-300 mb-8">The track you're looking for doesn't exist.</p>
            <Link href="/tracks" className="btn-outline text-lg px-8 py-3 rounded-lg border-pink-500/50 hover:border-pink-400 transition-all duration-300">
              ← Back to Tracks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{background: 'var(--bg-primary)'}}>
      <Navbar currentPath={pathname} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/tracks" className="text-gray-400 hover:text-white transition-colors">
                  Tracks
                </Link>
              </li>
              <li>
                <span className="text-gray-500 mx-2">/</span>
              </li>
              <li>
                <span className="text-white font-medium">{track.name}</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Track Header */}
        <div className="glass-card p-8 mb-12" style={{boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'}}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-4">
                {track.name} <span className="text-gradient">Track</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
                {track.description}
              </p>
            </div>
            <div className="flex items-center space-x-3 ml-6">
              <span className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg border border-purple-500/30 text-sm font-medium">
                {track.domain}
              </span>
            </div>
          </div>

          {/* Track Levels */}
          <div className="flex flex-wrap gap-3">
            {track.levels.map((level, index) => (
              <span
                key={index}
                className={`px-4 py-2 rounded-lg border text-sm font-medium ${getDifficultyClass(level)}`}
              >
                {getDifficultyIcon(level)} {level}
              </span>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">
              Track <span className="text-gradient">Projects</span>
            </h2>
            
            {/* Difficulty Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-white">Filter:</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 bg-black/50 border border-pink-500/30 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-400 transition-all duration-200"
              >
                <option value="all">All Levels</option>
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">🚀 Intermediate</option>
                <option value="advanced">🔥 Advanced</option>
              </select>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-white mb-3">No Projects Available</h3>
              <p className="text-gray-300 mb-6">
                {selectedDifficulty === 'all' 
                  ? "No projects available for this track yet."
                  : `No ${selectedDifficulty} projects available for this track.`
                }
              </p>
              {selectedDifficulty !== 'all' && (
                <button
                  onClick={() => setSelectedDifficulty('all')}
                  className="btn-outline px-6 py-3 rounded-lg border-pink-500/50 hover:border-pink-400 transition-all duration-300"
                >
                  Show All Projects
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="group relative bg-black/90 rounded-2xl shadow-lg transition-all duration-500 overflow-hidden border border-pink-500/30 hover:border-pink-400/50 backdrop-blur-xl"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    boxShadow: '0 0 40px rgba(255, 0, 128, 0.2)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 via-purple-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

                  <div className="relative z-10 p-6">
                    <div className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors line-clamp-2">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyClass(project.difficulty)} border`}>
                              {getDifficultyIcon(project.difficulty)} {project.difficulty}
                            </span>
                            {project.is_community && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-900 text-purple-200 border border-purple-500/30">
                                🤝 Community
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                        {project.description}
                      </p>
                    </div>

                    {/* Tech Stack */}
                    {project.tech_stack && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {project.tech_stack.split(',').slice(0, 3).map((tech, i) => (
                          <span key={i} className="px-3 py-1 bg-pink-800/40 text-pink-200 text-xs font-medium rounded-full border border-pink-600/30">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Project Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span>⏱️ {project.estimated_hours}h</span>
                      <span>👥 Max {project.max_team_size}</span>
                    </div>

                    {/* CTA */}
                    <div className="mt-6">
                      <Link href={`/projects/${project.id}`} passHref>
                        <span className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                          Start Project
                          <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
