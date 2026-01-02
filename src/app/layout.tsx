import type { Metadata } from 'next'
import { PT_Serif } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const ptSerif = PT_Serif({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pt-serif',
})

export const metadata: Metadata = {
  title: 'Jaynish Shah – Product Designer, Design Systems',
  description: 'Product Designer, Design Systems',
  openGraph: {
    title: 'Jaynish Shah',
    description: 'Product Designer, Design Systems',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-US">
      <body className={ptSerif.variable}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

