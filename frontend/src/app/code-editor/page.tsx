'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function CodeEditorPage() {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen relative" style={{background: 'var(--bg-primary)'}}>
      <Navbar currentPath={pathname} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Code Editor</h1>
          <p className="text-xl text-gray-300">Interactive code editor coming soon...</p>
        </div>
      </div>
    </div>
  );
}
