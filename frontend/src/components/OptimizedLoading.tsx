'use client'

import { memo } from 'react'

interface OptimizedLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const OptimizedLoading = memo(function OptimizedLoading({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: OptimizedLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
})

export default OptimizedLoading
