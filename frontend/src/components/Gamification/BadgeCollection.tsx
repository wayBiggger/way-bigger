'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '../../types/gamification';
import { gamificationService } from '../../services/gamificationService';

interface BadgeCollectionProps {
  userId: string;
}

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({ userId }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    try {
      const data = await gamificationService.getUserBadges(userId);
      // Handle both array and object with badges property
      const badgesArray = Array.isArray(data) ? data : ((data as any).badges || []);
      setBadges(badgesArray);
    } catch (error) {
      console.error('Failed to load badges:', error);
      setBadges([]); // Ensure badges is always an array
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-500/20';
      case 'rare': return 'shadow-blue-500/30';
      case 'epic': return 'shadow-purple-500/40';
      case 'legendary': return 'shadow-yellow-500/50';
      default: return 'shadow-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Badge Collection</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Ensure badges is always an array
  const safeBadges = Array.isArray(badges) ? badges : [];

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-white mb-4">Badge Collection ({safeBadges.length})</h2>
      
      {safeBadges.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-gray-400">No badges earned yet. Complete projects to earn your first badge!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {safeBadges.map((badge) => (
            <div
              key={badge.id}
              className={`text-center p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 shadow-lg ${getRarityGlow(badge.rarity)}`}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <div className={`text-sm font-semibold ${getRarityColor(badge.rarity)}`}>
                {badge.name}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(badge.earned_date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;