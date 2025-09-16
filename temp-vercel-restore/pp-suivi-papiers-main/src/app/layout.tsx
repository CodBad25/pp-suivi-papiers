import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TouchInfoProvider } from '../components/TouchInfoProvider'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: 'Suivi Administratif',
  description: 'Application de suivi administratif pour les élèves',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={inter.className}>
        <TouchInfoProvider>
          {children}
        </TouchInfoProvider>
      </body>
    </html>
  )
}

