'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  const [activeTab, setActiveTab] = useState('SERVICES');

  const navItems = ['HOME', 'SERVICES', 'WORK', 'PLANS', 'TEAM'];

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-8 py-6">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-800">
          WAY BIGGER
        </div>
        
        {/* Navigation */}
        <nav className="flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item}
              href="#"
              className={`relative text-gray-800 font-medium transition-all duration-300 ${
                activeTab === item ? 'text-gray-900' : 'hover:text-gray-600'
              }`}
              onMouseEnter={() => setActiveTab(item)}
              onMouseLeave={() => setActiveTab('SERVICES')}
            >
              {item}
              {activeTab === item && (
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-400 shadow-lg shadow-orange-400/50" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
