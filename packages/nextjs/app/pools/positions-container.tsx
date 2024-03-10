'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import InboxIcon from '@/components/icon/inbox'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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
  const emptyContent = (
    <div className="flex flex-col items-center text-center font-mediuml">
      <InboxIcon className="w-12 h-12 mt-8 mb-4" />
      <div className="mb-8">您的流动性仓位将在此展示。</div>
    </div>
  )
  return (
    <div className="border rounded-2xl flex flex-col">
      <div className="flex flex-col items-center justify-center m-auto w-full">
        {isConnected ? (
          children
        ) : (
          <>
            {emptyContent}
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
