import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "react-hot-toast"
import GradientBackground from '@/components/GradientBackground'
import type { Viewport } from 'next'


export const metadata = {
  title: 'Aura Checker',
  description: 'Get a vibe check on two Twitter users',
}
 
export const viewport: Viewport = {
  themeColor: '#141720',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} min-h-screen w-screen overflow-x-hidden bg-black`}>
        <Toaster position="top-center" />
        <GradientBackground>
          {children}
        </GradientBackground>
        <Analytics />
      </body>
    </html>
  )
}

