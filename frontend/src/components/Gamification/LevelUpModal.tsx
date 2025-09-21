'use client';

import React, { useEffect, useState } from 'react';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, newLevel, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][
                    Math.floor(Math.random() * 5)
                  ],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal Content */}
      <div className="relative glass-card p-8 max-w-md mx-4 text-center animate-scale-in">
        <div className="text-8xl mb-4 animate-bounce">🎉</div>
        
        <h2 className="text-3xl font-bold text-white mb-2">
          Level Up!
        </h2>
        
        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
          Level {newLevel}
        </div>
        
        <p className="text-gray-300 mb-6">
          Congratulations! You've reached a new level and unlocked new features!
        </p>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <span>✨</span>
            <span>New features unlocked</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-blue-400">
            <span>🏆</span>
            <span>Badge rewards available</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-yellow-400">
            <span>⚡</span>
            <span>XP multiplier active</span>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="glass-button-primary px-6 py-3 text-lg font-semibold hover:scale-105 transition-transform"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;