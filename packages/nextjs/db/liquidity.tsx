import prisma, { Exchange, Token } from '@web3-from-scratch/db'

export async function getLiquidityPositionsForAddress(address: string) {
  const liquidityEvents = await prisma.liquidityEvent.findMany({
    where: {
      providerAddress: address,
    },
    include: {
      exchange: {
        include: {
          token: true
        }
      }
    },
  })

  // Step 2 & 3: Aggregate liquidity by exchange
  const exchangeShares = liquidityEvents.reduce<{
    [exchangeId: number]: {
      exchange: Exchange
      totalLiquidity: bigint
      token: Token
    }
  }>((acc, event) => {
    const exchangeId = event.exchangeId
    if (!acc[exchangeId]) {
      acc[exchangeId] = {
        exchange: event.exchange,
        totalLiquidity: BigInt(0),
        token: event.exchange.token
      }
    }
    acc[exchangeId].totalLiquidity =
      acc[exchangeId].totalLiquidity + BigInt(event.liquidity)
    return acc
  }, {})

  // Fetch exchange details with aggregated liquidity
  const exchangesWithShares = Object.values(exchangeShares).map(
    ({ exchange, token, totalLiquidity }) => ({
      exchangeId: exchange.exchangeId,
      // exchange,
      exchangeAddress: exchange.exchangeAddress,
      totalLiquidity: totalLiquidity.toString(),
      token
    })
  )

  return exchangesWithShares
}
