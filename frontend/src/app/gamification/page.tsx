'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProgressDashboard from '../../components/Gamification/ProgressDashboard';
import BadgeCollection from '../../components/Gamification/BadgeCollection';
import StreakTracker from '../../components/Gamification/StreakTracker';
import Leaderboard from '../../components/Gamification/Leaderboard';
import LevelUpModal from '../../components/Gamification/LevelUpModal';
import AchievementNotification from '../../components/Gamification/AchievementNotification';
import { useGamification } from '../../hooks/useGamification';
import { Badge } from '../../types/gamification';

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState('progress');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  // Mock user ID - in real app, get from auth context
  const userId = 'user-123';

  const { progress, badges, loading, error, awardXP } = useGamification(userId);

  // Check for level up
  useEffect(() => {
    if (progress && progress.level > 1) {
      setShowLevelUp(true);
      setNewLevel(progress.level);
    }
  }, [progress?.level]);

  // Check for new badges
  useEffect(() => {
    if (badges.length > 0) {
      const latestBadge = badges[badges.length - 1];
      const isRecent = new Date(latestBadge.earned_date).getTime() > Date.now() - 5000; // 5 seconds ago
      if (isRecent) {
        setNewBadge(latestBadge);
        setShowAchievement(true);
      }
    }
  }, [badges]);

  const handleAwardXP = async (action: keyof typeof import('../../types/gamification').XP_REWARDS) => {
    await awardXP(action, { timestamp: new Date().toISOString() });
  };

  const tabs = [
    { id: 'progress', label: 'Progress', icon: '📊' },
    { id: 'badges', label: 'Badges', icon: '🏆' },
    { id: 'streak', label: 'Streak', icon: '🔥' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏅' },
  ];

  if (loading) {
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

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="glass-card mx-4 p-8 animate-pulse" style={{
            boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
          }}>
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="glass-card mx-4 p-8 text-center" style={{
            boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
          }}>
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              <span className="text-gradient">Oops! Something went wrong</span>
            </h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 border border-pink-500/50 hover:border-pink-400"
              style={{
                boxShadow: '0 0 20px rgba(255, 0, 128, 0.3)'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="glass-card mx-4 p-6 mb-8" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-gradient">Gamification Dashboard</span>
          </h1>
          <p className="text-gray-300">Track your progress, earn badges, and compete with others!</p>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card mx-4 p-2 mb-8" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {activeTab === 'progress' && (
            <div className="lg:col-span-2">
              <ProgressDashboard userId={userId} />
            </div>
          )}
          
          {activeTab === 'badges' && (
            <div className="lg:col-span-2">
              <BadgeCollection userId={userId} />
            </div>
          )}
          
          {activeTab === 'streak' && (
            <div className="lg:col-span-2">
              <StreakTracker userId={userId} />
            </div>
          )}
          
          {activeTab === 'leaderboard' && (
            <div className="lg:col-span-2">
              <Leaderboard userId={userId} />
            </div>
          )}
        </div>

        {/* Test XP Award Buttons (for development) */}
        <div className="glass-card mx-4 p-6 mt-8" style={{
          boxShadow: '0 0 20px rgba(255, 0, 128, 0.1)'
        }}>
          <h3 className="text-lg font-semibold text-white mb-4">
            <span className="text-gradient">Test XP System</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAwardXP('PROJECT_COMPLETE')}
              className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 text-sm"
              style={{
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
              }}
            >
              Complete Project (+100 XP)
            </button>
            <button
              onClick={() => handleAwardXP('STREAK_DAY')}
              className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 text-sm"
              style={{
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
              }}
            >
              Daily Streak (+25 XP)
            </button>
            <button
              onClick={() => handleAwardXP('CODE_QUALITY_HIGH')}
              className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 text-sm"
              style={{
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
              }}
            >
              High Quality Code (+75 XP)
            </button>
            <button
              onClick={() => handleAwardXP('COLLABORATION_JOIN')}
              className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 text-sm"
              style={{
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
              }}
            >
              Join Collaboration (+150 XP)
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LevelUpModal
        isOpen={showLevelUp}
        newLevel={newLevel}
        onClose={() => setShowLevelUp(false)}
      />

      {newBadge && (
        <AchievementNotification
          badge={newBadge}
          onClose={() => {
            setShowAchievement(false);
            setNewBadge(null);
          }}
        />
      )}
    </div>
  );
}
