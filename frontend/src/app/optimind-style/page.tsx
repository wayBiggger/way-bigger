'use client';

import React, { useState } from 'react';
import Header from '@/components/OPTIMINDStyle/Header';
import HeroSection from '@/components/OPTIMINDStyle/HeroSection';
import ServicesSection from '@/components/OPTIMINDStyle/ServicesSection';

const OptimindStylePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    <HeroSection key="hero" />,
    <ServicesSection key="services" />,
    // Add more pages as needed
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="relative">
        {pages[currentPage]}
        
        {/* Page Navigation */}
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
          <div className="flex flex-col space-y-3">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentPage === index
                    ? 'bg-orange-400 shadow-lg shadow-orange-400/50'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Page Counter */}
        <div className="fixed bottom-8 right-8 z-40">
          <div className="text-sm text-gray-500 font-medium">
            {String(currentPage + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OptimindStylePage;
