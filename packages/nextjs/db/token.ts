import db from '@min-dex/db'

export async function getAllTokensWithExchanges() {
  try {
    const tokens = await db.token.findMany({
      include: {
        exchanges: true,
      },
    })
    console.log('Tokens with their exchanges:', tokens)
    return tokens.map(({ exchanges, ...restToken }) => ({
      ...restToken,
      exchangeAddress: exchanges[0].exchangeAddress,
    }))
  } catch (error) {
    console.error('Error fetching tokens with their exchanges:', error)
    throw error
  }
}

export async function getTokenById(tokenId: number) {
  try {
    const token = await db.token.findUnique({
      where: {
        tokenId,
      },
      include: {
        exchanges: true,
      },
    })
    console.log('Tokens fetched:', token)
    if (!token) {
      return token
    }
    const { exchanges, ...restToken } = token
    return {
      ...restToken,
      exchangeAddress: exchanges[0].exchangeAddress,
      exchangeId: exchanges[0].exchangeId
    }
  } catch (error) {
    console.error('Error fetching token:', error)
    throw error
  }
}
