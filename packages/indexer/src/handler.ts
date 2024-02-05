import { ethers } from 'ethers'
import { prisma } from './lib/prisma'
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
  } catch (err) {
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
  await prisma.$transaction(async (tx) => {
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
