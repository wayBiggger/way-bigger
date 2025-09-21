// Static asset optimization service

export interface AssetOptimizationConfig {
  images: {
    quality: number
    formats: string[]
    sizes: number[]
    lazyLoad: boolean
  }
  fonts: {
    preload: boolean
    display: 'swap' | 'block' | 'fallback'
  }
  scripts: {
    defer: boolean
    async: boolean
    preload: boolean
  }
  styles: {
    critical: boolean
    inline: boolean
  }
}

const defaultConfig: AssetOptimizationConfig = {
  images: {
    quality: 75,
    formats: ['webp', 'avif'],
    sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    lazyLoad: true
  },
  fonts: {
    preload: true,
    display: 'swap'
  },
  scripts: {
    defer: true,
    async: true,
    preload: false
  },
  styles: {
    critical: true,
    inline: false
  }
}

export class AssetOptimizer {
  private config: AssetOptimizationConfig

  constructor(config: Partial<AssetOptimizationConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  // Image optimization
  optimizeImage(src: string, options: {
    width?: number
    height?: number
    quality?: number
    format?: string
  } = {}): string {
    const { width = 400, height = 300, quality = this.config.images.quality, format = 'webp' } = options

    if (src.startsWith('http')) {
      const params = new URLSearchParams({
        url: src,
        w: width.toString(),
        h: height.toString(),
        q: quality.toString(),
        f: format
      })
      return `/_next/image?${params.toString()}`
    }

    return src
  }

  // Font optimization
  generateFontPreloadLinks(fonts: string[]): string[] {
    if (!this.config.fonts.preload) return []

    return fonts.map(font => {
      const href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@300;400;500;600;700;800&display=${this.config.fonts.display}`
      return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">`
    })
  }

  // Script optimization
  optimizeScript(src: string, options: {
    defer?: boolean
    async?: boolean
    preload?: boolean
  } = {}): string {
    const { defer = this.config.scripts.defer, async = this.config.scripts.async, preload = this.config.scripts.preload } = options

    let script = `<script src="${src}"`
    if (defer) script += ' defer'
    if (async) script += ' async'
    script += '></script>'

    if (preload) {
      const preloadLink = `<link rel="preload" href="${src}" as="script">`
      return preloadLink + script
    }

    return script
  }

  // CSS optimization
  optimizeCSS(href: string, options: {
    critical?: boolean
    inline?: boolean
  } = {}): string {
    const { critical = this.config.styles.critical, inline = this.config.styles.inline } = options

    if (inline) {
      return `<style>/* Inline CSS would go here */</style>`
    }

    if (critical) {
      return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">`
    }

    return `<link rel="stylesheet" href="${href}">`
  }

  // Generate responsive image sizes
  generateResponsiveSizes(breakpoints: number[] = this.config.images.sizes): string {
    return breakpoints
      .map(bp => `(max-width: ${bp}px) ${bp}px`)
      .join(', ') + ', 100vw'
  }

  // Preload critical assets
  preloadCriticalAssets(assets: {
    images?: string[]
    fonts?: string[]
    scripts?: string[]
  }): string[] {
    const preloadLinks: string[] = []

    // Preload critical images
    if (assets.images) {
      assets.images.forEach(src => {
        preloadLinks.push(`<link rel="preload" href="${src}" as="image">`)
      })
    }

    // Preload critical fonts
    if (assets.fonts) {
      assets.fonts.forEach(font => {
        preloadLinks.push(`<link rel="preload" href="${font}" as="font" type="font/woff2" crossorigin>`)
      })
    }

    // Preload critical scripts
    if (assets.scripts) {
      assets.scripts.forEach(src => {
        preloadLinks.push(`<link rel="preload" href="${src}" as="script">`)
      })
    }

    return preloadLinks
  }

  // Generate manifest for PWA
  generateManifest(): object {
    return {
      name: 'WayBigger - Learn Coding Through Real Projects',
      short_name: 'WayBigger',
      description: 'Master programming with hands-on projects',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#3B82F6',
      icons: [
        {
          src: '/images/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/images/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  }

  // Generate service worker for caching
  generateServiceWorker(): string {
    return `
const CACHE_NAME = 'waybigger-v1';
const urlsToCache = [
  '/',
  '/projects',
  '/static/css/main.css',
  '/static/js/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
    `.trim()
  }
}

// Export singleton instance
export const assetOptimizer = new AssetOptimizer()
