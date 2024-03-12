import { Button } from '@/components/ui/button'
import { getLiquidityPositionsForAddress } from '@/db/liquidity'
import Link from 'next/link'
import Empty from './empty'

export default async function PositionsList(props: { address?: string }) {
  const { address } = props
  const positions = address
    ? await getLiquidityPositionsForAddress(address)
    : []
  if (!positions.length) {
    return <Empty />
  }
  return (
    <div className="w-full p-3">
      <h4 className="px-2 mb-1 text-sm">您的仓位({positions.length})</h4>
      {positions.map((x) => (
        <PositionItem
          key={x.exchangeId}
          symbol={x.token.tokenSymbol ?? '??'}
          address={x.token.tokenAddress}
        />
      ))}
    </div>
  )
}

function PositionItem(props: { symbol: string; address: string }) {
  const { symbol, address } = props
  return (
    <div className="p-3 rounded-xl flex items-center justify-between transition-all hover:bg-accent hover:text-accent-foreground">
      <div className="flex items-center">
        <img
          className="w-[32px] h-[32px] rounded-full mr-4"
          src="https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x111111111117dC0aa78b770fA6A738034120C302/logo.png"
          alt={`${symbol}-logo`}
        />
        <div className="font-semibold mr-4">{symbol}/ETH</div>
        <div className="text-sm font-light">0.3%</div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <Link href={{ pathname: '/add', query: { tokenAddress: address } }}>
            添加
          </Link>
        </Button>
        <Button variant="outline">
          <Link href="/remove">移除</Link>
        </Button>
      </div>
    </div>
  )
}
