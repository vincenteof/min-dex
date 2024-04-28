import db, { Exchange, Token } from '@min-dex/db'

export async function getLiquidityPositionsForAddress(address: string) {
  const liquidityEvents = await db.liquidityEvent.findMany({
    where: {
      providerAddress: address,
    },
    include: {
      exchange: {
        include: {
          token: true,
        },
      },
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
        token: event.exchange.token,
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
      token,
    })
  )

  return exchangesWithShares
}

async function getPoolAmounts(exchangeId: number) {
  const liquidityEvents = await db.liquidityEvent.findMany({
    where: {
      exchangeId,
    },
    select: {
      ethAmount: true,
      tokenAmount: true,
      liquidity: true,
      eventType: true,
    },
  })

  let ethPoolAmount = BigInt(0)
  let tokenPoolAmount = BigInt(0)
  let liquidity = BigInt(0)

  for (const event of liquidityEvents) {
    if (event.eventType === 'LiquidityAdded') {
      ethPoolAmount += BigInt(event.ethAmount)
      tokenPoolAmount += BigInt(event.tokenAmount)
      liquidity += BigInt(event.liquidity)
    } else {
      ethPoolAmount -= BigInt(event.ethAmount)
      tokenPoolAmount -= BigInt(event.tokenAmount)
      liquidity -= BigInt(event.liquidity)
    }
  }

  return {
    ethPoolAmount,
    tokenPoolAmount,
    liquidity,
  }
}

export async function getMatchedTokenAmount(
  tokenId: number,
  ethAmount: string
) {
  const exchanges = await db.exchange.findMany({
    where: {
      tokenId: tokenId,
    },
    select: {
      exchangeId: true,
    },
  })
  const exchangeId = exchanges.map((exchange) => exchange.exchangeId)[0]
  if (exchangeId === undefined) {
    console.warn(`No matching exchange for tokenId: ${tokenId}`)
    return '0'
  }

  const { ethPoolAmount, tokenPoolAmount } = await getPoolAmounts(exchangeId)
  if (ethPoolAmount === BigInt(0) && tokenPoolAmount === BigInt(0)) {
    return null
  }
  if (ethPoolAmount !== BigInt(0) && tokenPoolAmount !== BigInt(0)) {
    const tokenAmount = (BigInt(ethAmount) * tokenPoolAmount) / ethPoolAmount
    return tokenAmount.toString()
  }
  throw new Error(`One of the pool amount is zero for tokenId: ${tokenId}`)
}

export async function getMatchedEthAmount(
  tokenId: number,
  tokenAmount: string
) {
  const exchanges = await db.exchange.findMany({
    where: {
      tokenId: tokenId,
    },
    select: {
      exchangeId: true,
    },
  })
  const exchangeId = exchanges.map((exchange) => exchange.exchangeId)[0]
  if (exchangeId === undefined) {
    console.warn(`No matching exchange for tokenId: ${tokenId}`)
    return '0'
  }

  const { ethPoolAmount, tokenPoolAmount } = await getPoolAmounts(exchangeId)
  if (ethPoolAmount === BigInt(0) && tokenPoolAmount === BigInt(0)) {
    return null
  }
  if (ethPoolAmount !== BigInt(0) && tokenPoolAmount !== BigInt(0)) {
    const ethAmount = (BigInt(tokenAmount) * ethPoolAmount) / tokenPoolAmount
    return ethAmount.toString()
  }
  throw new Error(`One of the pool amount is zero for tokenId: ${tokenId}`)
}

export async function getTotalLiquidityForAddress(
  exchangeId: number,
  providerAddress: string
) {
  const liquidityEvents = await db.liquidityEvent.findMany({
    where: {
      exchangeId,
      providerAddress,
    },
    select: {
      liquidity: true,
      eventType: true,
    },
  })

  return liquidityEvents
    .reduce((total, event) => {
      if (event.eventType === 'LiquidityAdded') {
        return total + BigInt(event.liquidity)
      } else {
        return total - BigInt(event.liquidity)
      }
    }, BigInt(0))
    .toString()
}
