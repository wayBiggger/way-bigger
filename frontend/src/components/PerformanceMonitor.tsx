'use client'

import { useEffect } from 'react'

export default function PerformanceMonitor() {
  useEffect(() => {
    // Performance monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Web Vitals monitoring
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime)
          } else if (entry.entryType === 'first-input') {
            const fidEntry = entry as any
            console.log('FID:', fidEntry.processingStart - fidEntry.startTime)
          } else if (entry.entryType === 'layout-shift') {
            console.log('CLS:', (entry as any).value)
          }
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

      // Core Web Vitals
      const measureWebVitals = () => {
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          console.log('LCP:', lastEntry.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // FID (First Input Delay)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach((entry) => {
            const fidEntry = entry as any
            console.log('FID:', fidEntry.processingStart - fidEntry.startTime)
          })
        }).observe({ entryTypes: ['first-input'] })

        // CLS (Cumulative Layout Shift)
        let clsValue = 0
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          console.log('CLS:', clsValue)
        }).observe({ entryTypes: ['layout-shift'] })
      }

      measureWebVitals()

      // Resource timing
      window.addEventListener('load', () => {
        const resources = performance.getEntriesByType('resource')
        const totalLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
        console.log('Total Load Time:', totalLoadTime)
        console.log('Resources loaded:', resources.length)
      })

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory
        console.log('Memory Usage:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
        })
      }
    }
  }, [])

  return null
}
