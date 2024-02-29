import prisma from '@web3-from-scratch/db'

export async function getAllTokensWithExchanges() {
  try {
    const tokens = await prisma.token.findMany({
      include: {
        exchanges: true,
      },
    })
    console.log('Tokens with their exchanges:', tokens)
    return tokens
  } catch (error) {
    console.error('Error fetching tokens with their exchanges:', error)
    throw error
  }
}
