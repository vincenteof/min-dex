'use client'

// todo: update wagmi version

import { useState, useEffect } from 'react'
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit'
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  goerli,
  hardhat,
} from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import TrpcQueryClientProvider from '@/lib/trpc/provider'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    zora,
    // todo: add env to enable it
    hardhat,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
)

const projectId = '3a8170812b534d0ff9d794f19a901d64'

const { wallets } = getDefaultWallets({
  appName: 'W3FS',
  projectId,
  chains,
})

const demoAppInfo = {
  appName: 'W3FS',
}

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export function Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} appInfo={demoAppInfo}>
        <TrpcQueryClientProvider>{mounted && children}</TrpcQueryClientProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
