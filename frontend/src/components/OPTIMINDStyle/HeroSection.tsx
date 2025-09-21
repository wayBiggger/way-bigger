'use client';

import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center">
      <div className="max-w-7xl mx-auto px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            {/* Page Indicator */}
            <div className="text-sm text-gray-500 font-medium">
              002 / 005
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              WE'RE A FULL-SERVICE
              <br />
              <span className="text-gray-800">LEARNING PLATFORM</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              We deliver complete project-based learning experiences under one roof.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex space-x-4 pt-4">
              <button className="px-8 py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-300">
                Get Started
              </button>
              <button className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-300">
                Learn More
              </button>
            </div>
          </div>
          
          {/* Right Side - Placeholder */}
          <div className="relative h-96 lg:h-[500px] flex items-center justify-center">
            <div className="text-6xl">🚀</div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
