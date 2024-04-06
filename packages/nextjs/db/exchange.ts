import db from '@min-dex/db'

export async function getExchangeById(exchangeId: number) {
  return db.exchange.findUnique({
    where: {
      exchangeId,
    },
    include: {
      token: true,
    },
  })
}

export async function getExchangeByAddress(exchangeAddress: string) {
  return db.exchange.findUnique({
    where: {
      exchangeAddress,
    },
  })
}
