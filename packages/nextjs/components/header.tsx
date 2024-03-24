import Link from 'next/link'
import EthIcon from '@/components/icon/eth'
import { CustomConnectButton } from '@/components/custom-connect-button'

export default function Header() {
  return (
    <header className="sticky w-full border-b">
      <div className="container flex items-center mx-auto h-16 px-8">
        <div className="flex mr-4">
          <EthIcon className="w-[22px] h-[35px] mr-6" />
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="swap">兑换</Link>
            <Link href="tokens">代币</Link>
            <Link href="pools">流动池</Link>
          </nav>
        </div>
        <div className="flex flex-1 justify-end">
          <CustomConnectButton />
        </div>
      </div>
    </header>
  )
}
