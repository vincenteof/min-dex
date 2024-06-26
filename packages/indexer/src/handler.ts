import { ethers } from 'ethers'
import db from '@min-dex/db'
import { provider } from './lib/ethers'
import erc20ABI from './abi/erc20'

async function fetchTokenDetail(tokenAddress: string) {
  const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider)
  try {
    const [name, symbol] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
    ])
    return { name, symbol }
  } catch (err: any) {
    console.warn(
      `Could not fetch details for token at ${tokenAddress}: ${err.message}`
    )
    return null
  }
}

export async function handleCreateExchangeEvent(
  tokenAddress: string,
  exchangeAddress: string
) {
  const tokenDetail = await fetchTokenDetail(tokenAddress)
  if (!tokenDetail) {
    return
  }
  const { name: tokenName, symbol: tokenSymbol } = tokenDetail
  await db.$transaction(async (tx) => {
    try {
      await tx.token.upsert({
        where: { tokenAddress },
        update: { tokenName, tokenSymbol },
        create: {
          tokenAddress,
          tokenName,
          tokenSymbol,
        },
      })

      await tx.exchange.create({
        data: {
          exchangeAddress,
          token: {
            connect: { tokenAddress },
          },
        },
      })

      console.log(
        `Handled ExchangeCreated: Token ${tokenAddress} with Exchange ${exchangeAddress}`
      )
    } catch (err) {
      console.error(
        `Error handling ExchangeCreated for ${tokenAddress}: ${err}`
      )
      throw err // Ensures transaction is rolled back in case of error
    }
  })
}

export async function handleLiquidityAddedEvent(
  exchangeAddress: string,
  tokenAddress: string,
  providerAddress: string,
  liquidity: bigint,
  tokenAmount: bigint,
  ethAmount: bigint
) {
  await handleLiquidityEvent(
    'LiquidityAdded',
    exchangeAddress,
    tokenAddress,
    providerAddress,
    liquidity,
    tokenAmount,
    ethAmount
  )
}

export async function handleLiquidityRemovedEvent(
  exchangeAddress: string,
  tokenAddress: string,
  providerAddress: string,
  liquidity: bigint,
  tokenAmount: bigint,
  ethAmount: bigint
) {
  await handleLiquidityEvent(
    'LiquidityRemoved',
    exchangeAddress,
    tokenAddress,
    providerAddress,
    liquidity,
    tokenAmount,
    ethAmount
  )
}

async function handleLiquidityEvent(
  eventType: 'LiquidityAdded' | 'LiquidityRemoved',
  exchangeAddress: string,
  tokenAddress: string,
  providerAddress: string,
  liquidity: bigint,
  tokenAmount: bigint,
  ethAmount: bigint
) {
  try {
    await db.$transaction(async (tx) => {
      // Fetch the Exchange Record to link to the provided Token Address
      const exchange = await tx.exchange.findUnique({
        where: { exchangeAddress },
        include: { token: true }, // This ensures the token related to the exchange is also fetched, though it may not be necessary if you're using the tokenAddress from the event directly.
      })

      if (!exchange || exchange.token.tokenAddress !== tokenAddress) {
        console.error(
          `Exchange not found or token address mismatch for exchange: ${exchangeAddress} and token: ${tokenAddress}`
        )
        return
      }

      // Assuming validation passed and you want to proceed with creating the liquidity event record
      await tx.liquidityEvent.create({
        data: {
          exchangeId: exchange.exchangeId,
          providerAddress,
          liquidity: liquidity.toString(),
          tokenAmount: tokenAmount.toString(),
          ethAmount: ethAmount.toString(),
          eventType,
        },
      })

      console.log(
        `Handled ${eventType} for exchange ${exchangeAddress}: Provider ${providerAddress}, Token Amount ${tokenAmount}, ETH Amount ${ethAmount}`
      )
    })
  } catch (err) {
    console.error(`Transaction failed for ${eventType}:`, err)
  }
}
