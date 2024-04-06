import { getExchangeByAddress } from '@/db/exchange'
import { getTotalLiquidityForAddress } from '@/db/liquidity'
import { isAddress } from 'viem'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const exchangeAddress = searchParams.get('exchangeAddress')
  const providerAddress = searchParams.get('providerAddress')
  if (
    !exchangeAddress ||
    !isAddress(exchangeAddress) ||
    !providerAddress ||
    !isAddress(providerAddress)
  ) {
    return Response.json({
      status: 'error',
      error: {
        code: 400,
        message: 'Bad Request',
        details: 'Params error',
      },
    })
  }

  const exchange = await getExchangeByAddress(exchangeAddress)
  const data = exchange?.exchangeId
    ? await getTotalLiquidityForAddress(exchange.exchangeId, providerAddress)
    : null
  return Response.json({
    status: 'success',
    data,
  })
}
