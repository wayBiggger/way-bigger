'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function CollaborationPage() {
  const pathname = usePathname();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'editor' | 'chat'>('projects');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock progress data
  const progress = { level: 5, projects_completed: 8 };

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    difficulty_level: 'intermediate',
    max_team_size: 5,
    min_team_size: 2,
    is_public: true
  });

  const canCollaborate = (progress?.level || 0) >= 3 && (progress?.projects_completed || 0) >= 5;

  // Mock functions
  const createProject = async (data: any) => {
    const project = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      difficulty_level: data.difficulty_level,
      max_team_size: data.max_team_size,
      min_team_size: data.min_team_size,
      is_public: data.is_public,
      status: 'active',
      progress_percentage: 0,
      created_by: 'user-123',
      created_at: new Date().toISOString()
    };
    setProjects(prev => [project, ...prev]);
    return project;
  };

  const joinProject = async (projectId: string) => {
    console.log('Joining project:', projectId);
    const project = projects.find(p => p.id === projectId);
    setCurrentProject(project);
    setSelectedProjectId(projectId);
    setActiveTab('editor');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const project = await createProject(newProject);
      setSelectedProjectId(project.id);
      setShowCreateProject(false);
      setActiveTab('editor');
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleJoinProject = async (projectId: string) => {
    try {
      await joinProject(projectId);
      setSelectedProjectId(projectId);
      setActiveTab('editor');
    } catch (error) {
      console.error('Failed to join project:', error);
    }
  };

  if (!canCollaborate) {
    return (
      <div className="min-h-screen bg-black">
        {/* Navigation */}
        <nav className="relative z-20 px-6 py-4 transition-all duration-500" style={{
          borderBottom: '3px solid rgba(255, 0, 128, 0.8)',
          boxShadow: '0 4px 30px rgba(255, 0, 128, 0.4), 0 0 60px rgba(255, 0, 128, 0.3), inset 0 -1px 0 rgba(255, 0, 128, 0.2)'
        }}>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-60"></div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-80"></div>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold text-white">WayBigger</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-white/80 hover:text-pink-400 transition-colors">Home</Link>
              <Link href="/projects" className="text-white/80 hover:text-pink-400 transition-colors">Projects</Link>
              <Link href="/tracks" className="text-white/80 hover:text-pink-400 transition-colors">Tracks</Link>
              <Link href="/community" className="text-white/80 hover:text-pink-400 transition-colors">Community</Link>
              <Link href="/profile" className="text-white/80 hover:text-pink-400 transition-colors">Profile</Link>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="glass-card mx-4 mt-8 mb-8" style={{
            boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
          }}>
            <div className="px-6 py-8 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-3xl font-bold mb-4 text-white">
                <span className="text-gradient">Collaboration Locked</span>
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                You need to reach Level 3 and complete 5 projects to unlock collaboration features.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="glass-card p-4" style={{
                  boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                }}>
                  <div className="text-2xl font-bold text-purple-400">
                    Level {progress?.level || 0}
                  </div>
                  <div className="text-sm text-gray-300">Current Level</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Need Level 3
                  </div>
                </div>
                <div className="glass-card p-4" style={{
                  boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                }}>
                  <div className="text-2xl font-bold text-blue-400">
                    {progress?.projects_completed || 0}
                  </div>
                  <div className="text-sm text-gray-300">Projects Completed</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Need 5 projects
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/code-editor"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-pink-500/50 hover:border-pink-400"
                  style={{
                    boxShadow: '0 0 20px rgba(255, 0, 128, 0.3)'
                  }}
                >
                  Start Coding to Unlock
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{background: 'var(--bg-primary)'}}>
      <Navbar currentPath={pathname} />

      {/* Header */}
      <div className="glass-card mx-4 mt-4 mb-4" style={{
        boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
      }}>
        <div className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              <span className="text-gradient">Team Collaboration</span>
            </h1>
            <div className="flex items-center gap-4">
              {currentProject && (
                <div className="text-sm text-gray-300">
                  Working on: <span className="text-pink-400">{currentProject.name}</span>
                </div>
              )}
              <button
                onClick={() => setShowCreateProject(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-pink-500/50 hover:border-pink-400"
                style={{
                  boxShadow: '0 0 20px rgba(255, 0, 128, 0.3)'
                }}
              >
                + New Project
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!selectedProjectId ? (
          // Project Selection
          <div className="space-y-6">
            <div className="glass-card mx-4 p-6" style={{
              boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
            }}>
              <h2 className="text-xl font-semibold text-white mb-4">
                <span className="text-gradient">My Projects</span>
              </h2>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🚀</div>
                  <p className="text-gray-300 mb-4">No projects yet. Create your first team project!</p>
                  <button
                    onClick={() => setShowCreateProject(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-pink-500/50 hover:border-pink-400"
                    style={{
                      boxShadow: '0 0 20px rgba(255, 0, 128, 0.3)'
                    }}
                  >
                    Create Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className="glass-card p-4 hover:bg-white/5 cursor-pointer transition-all"
                      style={{
                        boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                      }}
                      onClick={() => handleJoinProject(project.id)}
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">{project.name}</h3>
                      <p className="text-gray-300 text-sm mb-3">{project.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-pink-400">
                          {project.participants?.length || 0}/{project.max_team_size} members
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.difficulty_level === 'beginner' ? 'bg-green-900 text-green-300' :
                          project.difficulty_level === 'intermediate' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {project.difficulty_level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Collaboration Interface
          <div className="h-[calc(100vh-200px)]">
            {/* Tab Navigation */}
            <div className="glass-card mx-4 p-2 mb-4" style={{
              boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
            }}>
              <div className="flex gap-2">
                {[
                  { id: 'projects', label: 'Projects', icon: '📁' },
                  { id: 'editor', label: 'Code Editor', icon: '💻' },
                  { id: 'chat', label: 'Team Chat', icon: '💬' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                    style={activeTab === tab.id ? {
                      boxShadow: '0 0 15px rgba(255, 0, 128, 0.3)'
                    } : {}}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="h-full">
              {activeTab === 'projects' && (
                <div className="glass-card mx-4 p-6 h-full" style={{
                  boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">
                      <span className="text-gradient">All Projects</span>
                    </h2>
                    <button
                      onClick={() => setSelectedProjectId(null)}
                      className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
                      style={{
                        boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      Back to Projects
                    </button>
                  </div>
                  <div className="text-gray-300">
                    Project management interface would go here
                  </div>
                </div>
              )}

              {activeTab === 'editor' && (
                <div className="glass-card mx-4 h-full p-6" style={{
                  boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
                }}>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    <span className="text-gradient">Code Editor</span>
                  </h3>
                  <div className="text-center text-gray-300">
                    <div className="text-4xl mb-4">💻</div>
                    <p>Real-time collaborative code editor will be available here</p>
                    <p className="text-sm text-gray-400 mt-2">Project ID: {selectedProjectId}</p>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="glass-card mx-4 h-full p-6" style={{
                  boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
                }}>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    <span className="text-gradient">Team Chat</span>
                  </h3>
                  <div className="text-center text-gray-300">
                    <div className="text-4xl mb-4">💬</div>
                    <p>Real-time team chat will be available here</p>
                    <p className="text-sm text-gray-400 mt-2">Project ID: {selectedProjectId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-card p-8 max-w-md w-full mx-4" style={{
            boxShadow: '0 0 30px rgba(255, 0, 128, 0.3)'
          }}>
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="text-gradient">Create Team Project</span>
            </h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                  style={{
                    boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                  }}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                  style={{
                    boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                  }}
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={newProject.difficulty_level}
                  onChange={(e) => setNewProject({ ...newProject, difficulty_level: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                  style={{
                    boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={newProject.min_team_size}
                    onChange={(e) => setNewProject({ ...newProject, min_team_size: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/50 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                    style={{
                      boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={newProject.max_team_size}
                    onChange={(e) => setNewProject({ ...newProject, max_team_size: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-black/50 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                    style={{
                      boxShadow: '0 0 15px rgba(255, 0, 128, 0.1)'
                    }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={newProject.is_public}
                  onChange={(e) => setNewProject({ ...newProject, is_public: e.target.checked })}
                  className="w-4 h-4 text-pink-500 bg-black/50 border-pink-500/30 rounded focus:ring-pink-500"
                />
                <label htmlFor="is_public" className="text-sm text-gray-300">
                  Make project public (others can discover and join)
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
                  style={{
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-pink-500/50 hover:border-pink-400"
                  style={{
                    boxShadow: '0 0 20px rgba(255, 0, 128, 0.3)'
                  }}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
