'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DailyDashboard from '@/components/DailyDashboard';
import Navbar from '@/components/Navbar';
import { auth } from '@/utils/auth';

interface Project {
  id: number;
  title: string;
  description: string;
  tech_stack: string;
  difficulty: string;
  domain: string;
}

export default function Home() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = auth.isAuthenticated();
      setIsAuthenticated(authenticated);
    };
    
    checkAuth();
    
    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch intermediate projects from all domains for display
        const intermediateResponse = await fetch('http://localhost:8000/api/v1/projects/intermediate');
        const intermediateData = await intermediateResponse.json();
        setProjects(intermediateData.slice(0, 6));
        
        // Fetch total project count
        const totalResponse = await fetch('http://localhost:8000/api/v1/projects/');
        const totalData = await totalResponse.json();
        setProjectCount(totalData.length);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Set empty array on error to prevent issues
        setProjects([]);
        setProjectCount(0);
      }
    };

    fetchProjects();
  }, []);

  // If user is authenticated, show daily dashboard
  if (isAuthenticated) {
    return <DailyDashboard />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: 'var(--bg-primary)'}}>
      {/* Animated Background Glows */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glow-pink rounded-full animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-glow-purple rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-glow-cyan rounded-full animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Torch Light Effect from Bottom */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-96"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(255, 0, 128, 0.8) 0%, rgba(139, 92, 246, 0.6) 20%, rgba(0, 212, 255, 0.4) 40%, transparent 80%)',
            filter: 'blur(60px)',
            animation: 'torchFlicker 3s ease-in-out infinite alternate',
            opacity: 0.9
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-80"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(255, 0, 128, 1) 0%, rgba(139, 92, 246, 0.8) 30%, rgba(0, 212, 255, 0.5) 50%, transparent 70%)',
            filter: 'blur(30px)',
            animation: 'torchFlicker 2.5s ease-in-out infinite alternate',
            opacity: 1
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-48"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(255, 0, 128, 1) 0%, rgba(139, 92, 246, 0.9) 40%, transparent 60%)',
            filter: 'blur(15px)',
            animation: 'torchFlicker 2s ease-in-out infinite alternate',
            opacity: 1
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/3 h-24"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(255, 0, 128, 1) 0%, rgba(139, 92, 246, 1) 30%, transparent 50%)',
            filter: 'blur(5px)',
            animation: 'torchFlicker 1.5s ease-in-out infinite alternate',
            opacity: 1
          }}
        ></div>
      </div>

      {/* Navigation */}
      <Navbar currentPath={pathname} />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full glass-card mb-6">
              <span className="text-sm text-white">Build real projects</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              Build your career with{' '}
              <span className="text-gradient">WayBigger</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Master real-world projects and land your dream job. Join thousands of developers building 
              the future through hands-on experience.
            </p>
            
            <Link 
              href="/auth/signup" 
              className="btn-outline text-lg px-8 py-4 border-pink-500/50 hover:border-pink-400 transition-all duration-300"
              style={{
                boxShadow: '0 0 20px rgba(255, 0, 128, 0.2)',
                borderColor: 'rgba(255, 0, 128, 0.5)'
              }}
            >
              Start Building
            </Link>
          </div>
          
          {/* Project Stats Cards */}
          <div className="relative">
            {/* Main Projects Card */}
            <div className="financial-card max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Total Projects</h3>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2">1,500+</div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Beginner</span>
                <span>Advanced</span>
              </div>
            </div>

            {/* Side Cards */}
            <div className="flex justify-center space-x-4">
              <div className="financial-card w-48">
                <h4 className="text-sm text-gray-400 mb-2">Developers</h4>
                <div className="text-xl font-bold text-green-400">10,000+</div>
              </div>
              
              <div className="financial-card w-48">
                <h4 className="text-sm text-gray-400 mb-2">Hired</h4>
                <div className="text-xl font-bold text-white">500+</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>
          <p className="text-gray-400 mb-12">Trusted by 10,000+ developers</p>
          
          {/* Tech Stack Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Next.js', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Git', 'Figma'].map((tech, i) => (
              <div key={i} className="glass-card p-4 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                    <span className="text-white text-xs">{tech[0]}</span>
                  </div>
                  <span className="text-white text-sm">{tech}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-sm text-white">How it works</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white">
            How WayBigger makes your{' '}
            <span className="text-gradient">career journey easier</span>
          </h2>
        </div>
      </section>

      {/* Bottom Cards Section */}
      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Progress Card */}
            <div className="financial-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Your Progress</h3>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-green-400">12</div>
                  <div className="text-sm text-gray-400">Projects Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Level 5</div>
                  <div className="text-sm text-gray-400">Current Level</div>
                </div>
              </div>
            </div>

            {/* Get Started Card */}
            <div className="financial-card">
              <h3 className="text-xl font-semibold text-white mb-4">Start Your Journey</h3>
              <p className="text-gray-400 mb-6">
                Join thousands of developers building real projects and landing their dream jobs. 
                Choose from 1,500+ projects across all skill levels.
              </p>
              <Link 
                href="/auth/signup"
                className="btn-primary border-pink-500/50 hover:border-pink-400 transition-all duration-300"
                style={{
                  boxShadow: '0 0 20px rgba(255, 0, 128, 0.3)',
                  borderColor: 'rgba(255, 0, 128, 0.5)'
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-glow-pink rounded-full animate-float" style={{animationDelay: '6s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-glow-purple rounded-full animate-float" style={{animationDelay: '8s'}}></div>
      </div>
    </div>
  );
}
