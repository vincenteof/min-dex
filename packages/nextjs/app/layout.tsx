import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Provider } from './components/provider'
import { Toaster } from '@/components/ui/toaster'
import Header from './components/header'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Web3 from Scratch',
  description: 'Uniswap v1 like app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <Provider>
          <Header />
          <main className="flex min-h-screen flex-col items-center justify-between p-6">
            {children}
          </main>
          <Toaster />
        </Provider>
      </body>
    </html>
  )
}
