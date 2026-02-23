// import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
// import './globals.css'

// const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'VendorFlow - Complete Vendor Management Platform',
//   description: 'Streamline your vendor management, procurement, projects, and finances all in one platform.',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>{children}</body>
//     </html>
//   )
// }
// apps/web/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'VendorFlow - Complete Vendor Management Platform',
    template: '%s | VendorFlow'
  },
  description: 'Streamline your vendor management, procurement, projects, and finances all in one affordable platform. Start your free trial today.',
  keywords: ['vendor management', 'procurement software', 'project management', 'financial management', 'SaaS', 'business software'],
  authors: [{ name: 'VendorFlow', url: 'https://vendorflow.com' }],
  creator: 'VendorFlow',
  publisher: 'VendorFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://vendorflow.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'VendorFlow - Complete Vendor Management Platform',
    description: 'Streamline your vendor management, procurement, projects, and finances all in one affordable platform.',
    url: 'https://vendorflow.com',
    siteName: 'VendorFlow',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VendorFlow Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VendorFlow - Complete Vendor Management Platform',
    description: 'Streamline your vendor management, procurement, projects, and finances all in one affordable platform.',
    images: ['/twitter-image.jpg'],
    creator: '@vendorflow',
    site: '@vendorflow',
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
    google: 'your-google-verification-code', // Add your actual code
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  )
}