'use client'

import { Button } from '@/components/ui/button'
import InboxIcon from '@/components/icon/inbox'
import { useAccount, useContractRead, useNetwork } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import Core from '@web3-from-scratch/core-abi'
import Contracts from '@/lib/contracts'

export default function Pools() {
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { chain } = useNetwork()

  const factoryAddress = chain?.id ? Contracts[chain.id].Factory.address : '0x'
  const { data } = useContractRead({
    address: factoryAddress,
    abi: Core.Factory.abi,
    functionName: 'getExchange',
    args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
  })
  console.log('data: ', data)

  return (
    <section className="w-full max-w-3xl pt-12 flex flex-col gap-6">
      <div className="w-full flex items-center justify-between">
        <div className="text-3xl font-bold">流动池</div>
        <Button>+ 新的仓位</Button>
      </div>
      <div className="border rounded-2xl flex flex-col">
        <div className="flex flex-col items-center justify-center m-auto max-w-xs">
          <div className="flex flex-col items-center text-center font-medium">
            <InboxIcon className="w-12 h-12 mt-8 mb-4" />
            <div className="mb-8">您的流动性仓位将在此展示。</div>
          </div>
          {!isConnected && (
            <Button
              className="mb-8 px-8 py-6 text-xl"
              onClick={openConnectModal}
            >
              连接钱包
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
