'use client';

import React from 'react';

const ServicesSection: React.FC = () => {
  const services = [
    {
      title: "Project-Based Learning",
      description: "Hands-on coding projects across multiple domains",
      icon: "💻"
    },
    {
      title: "AI-Powered Guidance",
      description: "Personalized learning paths with AI assistance",
      icon: "🤖"
    },
    {
      title: "Team Collaboration",
      description: "Connect with peers and build together",
      icon: "👥"
    },
    {
      title: "Portfolio Building",
      description: "Create impressive projects for your resume",
      icon: "📁"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center">
      <div className="max-w-7xl mx-auto px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            {/* Page Indicator */}
            <div className="text-sm text-gray-500 font-medium">
              003 / 005
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              DISCOVER OUR
              <br />
              <span className="text-gray-800">SERVICES</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              We deliver complete AI automation services under one roof.
            </p>
          </div>
          
          {/* Right Side - Services Grid */}
          <div className="grid grid-cols-2 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className={`p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ${
                  index === 1 ? 'col-span-2' : ''
                }`}
              >
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;
