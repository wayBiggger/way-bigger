'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from '@/utils/auth';

interface NavbarProps {
  currentPath?: string;
}

export default function Navbar({ currentPath }: NavbarProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Simple theme detection without state management
  const isDarkTheme = typeof window !== 'undefined' && 
    typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        try {
          const profile = auth.getUser();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error getting user profile:', error);
        }
      }
    };
    
    checkAuth();
    
    // Check for saved theme preference
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');
      }
    }
    
    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    // Set up periodic token refresh (every 30 minutes)
    const refreshInterval = setInterval(async () => {
      if (auth.isAuthenticated()) {
        try {
          await auth.refreshTokenIfNeeded();
        } catch (error) {
          console.error('Periodic token refresh failed:', error);
        }
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
      clearInterval(refreshInterval);
    };
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = typeof window !== 'undefined' ? window.scrollY : 0;
      setIsScrolled(scrollTop > 10);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      setIsAuthenticated(false);
      setUserProfile(null);
      setShowUserMenu(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      auth.clearAuth();
      setIsAuthenticated(false);
      setUserProfile(null);
      setShowUserMenu(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'Tracks', href: '/tracks' },
    { name: 'Community', href: '/community' }
  ];

  const tools = [
    { name: 'Code Editor', href: '/code-editor' },
    { name: 'AI Assistant', href: '/ai-assistant' }
  ];

  const features = [
    { name: 'Collaboration', href: '/collaboration' },
    { name: 'Mentorship', href: '/mentorship' },
    { name: 'Challenges', href: '/challenges' },
    { name: 'Portfolio', href: '/portfolio' }
  ];

  const learning = [
    { name: 'Progress', href: '/gamification' },
    { name: 'Newsletter', href: '/letters' }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return currentPath === '/' || currentPath === undefined;
    }
    return currentPath?.startsWith(href) || false;
  };

  return (
    <nav className={`relative z-20 px-6 py-4 transition-all duration-500 ${
      isScrolled ? 'glass-card shadow-2xl' : 'bg-transparent'
    }`} style={{
      borderBottom: '3px solid rgba(255, 0, 128, 0.8)',
      boxShadow: '0 4px 30px rgba(255, 0, 128, 0.4), 0 0 60px rgba(255, 0, 128, 0.3), inset 0 -1px 0 rgba(255, 0, 128, 0.2)'
    }}>
      {/* Additional glow effect at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-60"></div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-80"></div>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold text-white">WayBigger</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:space-x-1">
          {/* Main Navigation */}
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive(item.href)
                  ? 'text-pink-400 bg-white/10' 
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* Tools Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setActiveDropdown('tools')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-white/80 hover:text-white hover:bg-white/5">
              <span>Tools</span>
              <svg className={`ml-1 w-4 h-4 transition-transform duration-200 ${activeDropdown === 'tools' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`absolute left-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-pink-500/30 rounded-lg shadow-2xl transition-all duration-200 z-50 ${
              activeDropdown === 'tools' ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`} style={{boxShadow: '0 0 40px rgba(255, 0, 128, 0.3)'}}>
              <div className="py-2">
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                      isActive(tool.href)
                        ? 'text-pink-400 bg-white/10'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Features Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setActiveDropdown('features')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-white/80 hover:text-white hover:bg-white/5">
              <span>Features</span>
              <svg className={`ml-1 w-4 h-4 transition-transform duration-200 ${activeDropdown === 'features' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`absolute left-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-pink-500/30 rounded-lg shadow-2xl transition-all duration-200 z-50 ${
              activeDropdown === 'features' ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`} style={{boxShadow: '0 0 40px rgba(255, 0, 128, 0.3)'}}>
              <div className="py-2">
                {features.map((feature) => (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                      isActive(feature.href)
                        ? 'text-pink-400 bg-white/10'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {feature.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setActiveDropdown('learning')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-white/80 hover:text-white hover:bg-white/5">
              <span>Learning</span>
              <svg className={`ml-1 w-4 h-4 transition-transform duration-200 ${activeDropdown === 'learning' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`absolute left-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-pink-500/30 rounded-lg shadow-2xl transition-all duration-200 z-50 ${
              activeDropdown === 'learning' ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`} style={{boxShadow: '0 0 40px rgba(255, 0, 128, 0.3)'}}>
              <div className="py-2">
                {learning.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-pink-400 bg-white/10'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Theme Toggle & User Menu */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors duration-200 text-white/80 hover:text-white hover:bg-white/5"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5 text-white/80 hover:text-white"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{userProfile?.username || 'User'}</div>
                  <div className="text-xs text-white/60">Level 5</div>
                </div>
                <svg className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-black/90 backdrop-blur-xl border border-pink-500/30 rounded-lg shadow-2xl z-50" style={{boxShadow: '0 0 40px rgba(255, 0, 128, 0.3)'}}>
                  <div className="p-3">
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{userProfile?.full_name || 'User'}</p>
                          <p className="text-xs text-white/60">{userProfile?.email || 'user@example.com'}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full">
                              Level 5
                            </span>
                            <span className="text-xs text-white/60">1,250 XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="font-medium">Profile</div>
                        <div className="text-xs text-white/60">Manage your account</div>
                      </Link>
                      <Link
                        href="/gamification"
                        className="block px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="font-medium">Progress</div>
                        <div className="text-xs text-white/60">Track your journey</div>
                      </Link>
                      <Link
                        href="/portfolio"
                        className="block px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="font-medium">Portfolio</div>
                        <div className="text-xs text-white/60">Showcase your work</div>
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="font-medium">Settings</div>
                        <div className="text-xs text-white/60">Preferences & privacy</div>
                      </Link>
                      <div className="border-t border-white/10 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-200 text-left"
                      >
                        <div className="font-medium">Sign Out</div>
                        <div className="text-xs text-red-400">End your session</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-white/80 hover:text-white hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="btn-outline text-sm px-4 py-2 rounded-lg border-pink-500/50 hover:border-pink-400 transition-all duration-300"
                style={{
                  boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)',
                  borderColor: 'rgba(255, 0, 128, 0.5)'
                }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-lg transition-all duration-200 text-white/80 hover:text-white hover:bg-white/5"
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden glass-card border-t border-white/10">
          <div className="pt-2 pb-3 space-y-1">
            {/* Main Navigation */}
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 text-base font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-pink-400 bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Tools Section */}
            <div className="px-4 py-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Tools
              </div>
            </div>
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-8 py-2 text-base font-medium transition-colors duration-200 ${
                  isActive(tool.href)
                    ? 'text-pink-400 bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {tool.name}
              </Link>
            ))}

            {/* Features Section */}
            <div className="px-4 py-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Features
              </div>
            </div>
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-8 py-2 text-base font-medium transition-colors duration-200 ${
                  isActive(feature.href)
                    ? 'text-pink-400 bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {feature.name}
              </Link>
            ))}

            {/* Learning Section */}
            <div className="px-4 py-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Learning
              </div>
            </div>
            {learning.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-8 py-2 text-base font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-pink-400 bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* User Section */}
            <div className="pt-4 border-t border-white/10">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-base font-medium transition-colors duration-200 text-white/80 hover:text-white hover:bg-white/5"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-4 py-2 text-base font-medium transition-colors duration-200 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-base font-medium transition-colors duration-200 text-white/80 hover:text-white hover:bg-white/5"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-base font-medium transition-colors duration-200 btn-outline border-pink-500/50 hover:border-pink-400"
                    style={{
                      boxShadow: '0 0 15px rgba(255, 0, 128, 0.2)',
                      borderColor: 'rgba(255, 0, 128, 0.5)'
                    }}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
