import prisma, { Exchange, Token } from '@web3-from-scratch/db'
import Big from 'big.js'

export async function getLiquidityPositionsForAddress(address: string) {
  const liquidityEvents = await prisma.liquidityEvent.findMany({
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
  const liquidityEvents = await prisma.liquidityEvent.findMany({
    where: {
      exchangeId,
    },
    select: {
      ethAmount: true,
      tokenAmount: true,
      liquidity: true,
    },
  })

  let ethPoolAmount = BigInt(0)
  let tokenPoolAmount = BigInt(0)
  let liquidity = BigInt(0)

  for (const event of liquidityEvents) {
    ethPoolAmount += BigInt(event.ethAmount)
    tokenPoolAmount += BigInt(event.tokenAmount)
    liquidity += BigInt(event.liquidity)
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
  const exchanges = await prisma.exchange.findMany({
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
  const tokenAmount = Big(ethAmount)
    .div(Big(ethPoolAmount.toString()))
    .mul(Big(tokenPoolAmount.toString()))
  return tokenAmount.toString()
}

export async function getMatchedEthAmount(
  tokenId: number,
  tokenAmount: string
) {
  const exchanges = await prisma.exchange.findMany({
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
  const ethAmount = Big(tokenAmount)
    .div(Big(tokenPoolAmount.toString()))
    .mul(Big(ethPoolAmount.toString()))

  return ethAmount.toString()
}
