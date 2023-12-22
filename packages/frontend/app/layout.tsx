import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Provider } from './components/provider'
import Header from './components/header'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <Provider>
          <Header />
          <main className="flex min-h-screen flex-col items-center justify-between p-24">
            {children}
          </main>
        </Provider>
      </body>
    </html>
  )
}
