'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ExactDesign: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-8 py-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold text-gray-800">
            WAY BIGGER
          </div>
          
          {/* Navigation */}
          <nav className="flex space-x-8">
            {['HOME', 'SERVICES', 'WORK', 'PLANS', 'TEAM'].map((item, index) => (
              <motion.a
                key={item}
                href="#"
                className={`relative text-gray-800 font-medium transition-all duration-300 ${
                  index === 1 ? 'text-gray-900' : 'hover:text-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {item}
                {index === 1 && (
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-400 shadow-lg shadow-orange-400/50"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.a>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Page Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-gray-500 font-medium"
              >
                002 / 005
              </motion.div>
              
              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight"
              >
                WE'RE A FULL-SERVICE
                <br />
                <span className="text-gray-800">LEARNING PLATFORM</span>
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xl text-gray-600 leading-relaxed max-w-lg"
              >
                We deliver complete project-based learning experiences under one roof.
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex space-x-4 pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-300"
                >
                  Get Started
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-300"
                >
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>
            
            {/* Right Side - Visual Element */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="relative h-96 lg:h-[500px]"
            >
              {/* Background circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-96 h-96 border border-gray-200 rounded-full opacity-20"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute w-80 h-80 border border-gray-300 rounded-full opacity-10"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute w-64 h-64 border border-gray-400 rounded-full opacity-5"
                />
              </div>
              
              {/* Placeholder */}
              <div className="relative z-10 w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg" style={{ maxWidth: '500px', maxHeight: '500px' }}>
                <div className="text-6xl">🚀</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2" />
        </motion.div>
      </motion.div>

      {/* Page Navigation Dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
        <div className="flex flex-col space-y-3">
          {[0, 1].map((index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-orange-400 shadow-lg shadow-orange-400/50'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
      
      {/* Page Counter */}
      <div className="fixed bottom-8 right-8 z-40">
        <div className="text-sm text-gray-500 font-medium">
          01 / 02
        </div>
      </div>
    </div>
  );
};

export default ExactDesign;
