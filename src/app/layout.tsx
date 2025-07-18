import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tetris Game',
  description: 'Modern Tetris game built with Next.js 15',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}