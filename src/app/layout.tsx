import type { Metadata } from 'next'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/600.css'
import '@fontsource/source-serif-4/400.css'
import '@fontsource/source-serif-4/400-italic.css'
import '@material-symbols/font-200/outlined.css'
import './globals.css'
import Footer from '@/components/Footer'
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl('/')),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  alternates: {
    types: {
      'application/rss+xml': absoluteUrl('/feed.xml'),
    },
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: 'website',
    url: absoluteUrl('/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const themeScript = `
    (function() {
      try {
        var theme = window.localStorage.getItem('theme-mode');
        if (theme === 'light' || theme === 'dark') {
          document.documentElement.dataset.theme = theme;
        }
      } catch (error) {}
    })();
  `

  return (
    <html lang="en-US">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  )
}
