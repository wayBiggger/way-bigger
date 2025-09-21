/**
 * Loading Spinner Component
 * Displays loading state for portfolio pages
 */

'use client';

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 rounded-full animate-spin border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-4 text-lg font-medium text-slate-600 dark:text-slate-300">
          Loading portfolio...
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Please wait while we fetch the latest data
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
