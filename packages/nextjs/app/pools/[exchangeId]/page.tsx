import { Button } from '@/components/ui/button'
import { getExchangeById } from '@/db/exchange'
import Link from 'next/link'

export default async function PoolPosition({
  params,
}: {
  params: { exchangeId: string }
}) {
  // todo: global error page
  const exchangeId = Number(params.exchangeId)
  const exchange = await getExchangeById(exchangeId)
  // todo: invariants for exchange existence
  return (
    <section className="w-full max-w-2xl pt-12 flex flex-col gap-6">
      <div className="w-full flex items-center justify-between">
        <div className="text-3xl font-bold">
          {exchange?.token?.tokenSymbol}/ETH
        </div>
        <div className="flex gap-1">
          <Button variant="outline">
            <Link
              href={{
                pathname: '/add',
                query: { tokenId: exchange?.token?.tokenId },
              }}
            >
              添加
            </Link>
          </Button>
          <Button variant="outline">
            <Link
              href={{
                pathname: '/remove',
                query: { tokenId: exchange?.token?.tokenId },
              }}
            >
              移除
            </Link>
          </Button>
        </div>
      </div>
      <div className="border rounded-2xl flex flex-col p-6"></div>
    </section>
  )
}
