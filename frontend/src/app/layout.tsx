import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import { Metadata } from 'next'

// Optimized font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-poppins',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'WayBigger - Learn Coding Through Real Projects',
    template: '%s | WayBigger'
  },
  description: 'Master programming with hands-on projects. Build real-world applications, learn cutting-edge technologies, and advance your coding career with our comprehensive project-based learning platform.',
  keywords: [
    'coding bootcamp',
    'programming projects',
    'learn to code',
    'web development',
    'software engineering',
    'coding challenges',
    'tech education',
    'programming courses',
    'coding practice',
    'developer skills'
  ],
  authors: [{ name: 'WayBigger Team' }],
  creator: 'WayBigger',
  publisher: 'WayBigger',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://waybigger.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://waybigger.com',
    title: 'WayBigger - Learn Coding Through Real Projects',
    description: 'Master programming with hands-on projects. Build real-world applications and advance your coding career.',
    siteName: 'WayBigger',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WayBigger - Learn Coding Through Real Projects',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WayBigger - Learn Coding Through Real Projects',
    description: 'Master programming with hands-on projects. Build real-world applications and advance your coding career.',
    images: ['/og-image.jpg'],
    creator: '@waybigger',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
