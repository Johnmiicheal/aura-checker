import './globals.css'
import { GeistSans } from 'geist/font/sans'

export const metadata = {
  title: 'Aura Checker',
  description: 'Get a vibe check on two Twitter users',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} min-h-screen bg-black`}>
        {children}
      </body>
    </html>
  )
}

