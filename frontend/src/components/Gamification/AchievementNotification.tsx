'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '../../types/gamification';

interface AchievementNotificationProps {
  badge: Badge;
  onClose: () => void;
  autoCloseDelay?: number;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  badge,
  onClose,
  autoCloseDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Auto-close timer
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, autoCloseDelay);

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (autoCloseDelay / 100));
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [onClose, autoCloseDelay]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-500/30';
      case 'rare': return 'shadow-blue-500/40';
      case 'epic': return 'shadow-purple-500/50';
      case 'legendary': return 'shadow-yellow-500/60';
      default: return 'shadow-gray-500/30';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`glass-card p-4 max-w-sm shadow-2xl ${getRarityGlow(badge.rarity)}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl animate-pulse">{badge.icon}</div>
          <div>
            <h3 className="font-bold text-white">Achievement Unlocked!</h3>
            <p className="text-sm text-gray-300">New Badge Earned</p>
          </div>
        </div>

        {/* Badge Info */}
        <div className="mb-3">
          <div className={`text-lg font-semibold bg-gradient-to-r ${getRarityColor(badge.rarity)} bg-clip-text text-transparent`}>
            {badge.name}
          </div>
          <p className="text-sm text-gray-400 mt-1">{badge.description}</p>
        </div>

        {/* Rarity Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white`}>
            {badge.rarity.toUpperCase()}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(badge.earned_date).toLocaleDateString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
          <div
            className={`h-1 bg-gradient-to-r ${getRarityColor(badge.rarity)} rounded-full transition-all duration-100`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;