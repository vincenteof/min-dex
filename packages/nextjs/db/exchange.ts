import prisma from '@min-dex/db'

export async function getExchangeById(exchangeId: number) {
  return prisma.exchange.findUnique({
    where: {
      exchangeId,
    },
    include: {
      token: true,
    },
  })
}

export async function getExchangeByAddress(exchangeAddress: string) {
  return prisma.exchange.findUnique({
    where: {
      exchangeAddress,
    },
  })
}
