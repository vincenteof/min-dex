'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Empty from './empty'

export default function PositionsContainer(props: { children: ReactNode }) {
  const { children } = props
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isConnected } = useAccount({
    onConnect: ({ address }) => {
      const current = new URLSearchParams(searchParams)
      if (address) {
        current.set('providerAddress', address)
        const search = current.toString()
        const query = search ? `?${search}` : ''
        router.push(`${pathname}${query}`)
      }
    },
    onDisconnect: () => {
      router.refresh()
    },
  })
  const { openConnectModal } = useConnectModal()
  return (
    <div className="border rounded-2xl flex flex-col">
      <div className="flex flex-col items-center justify-center m-auto w-full">
        {isConnected ? (
          children
        ) : (
          <>
            <Empty />
            <Button
              className="mb-8 px-8 py-6 text-xl"
              onClick={openConnectModal}
            >
              连接钱包
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
