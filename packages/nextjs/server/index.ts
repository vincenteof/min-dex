import { getAllTokensWithExchanges } from '@/db/token'
import { publicProcedure, router } from './trpc'
import { z } from 'zod'
import { getExchangeByAddress } from '@/db/exchange'
import {
  getMatchedEthAmount,
  getMatchedTokenAmount,
  getTotalLiquidityForAddress,
} from '@/db/liquidity'
import { isAddress } from 'viem'

export const appRouter = router({
  getTokens: publicProcedure.query(async () => {
    return await getAllTokensWithExchanges()
  }),
  getTotalLiquidity: publicProcedure
    .input(
      z.object({
        exchangeAddress: z.string().refine((addr) => isAddress(addr)),
        providerAddress: z.string().refine((addr) => isAddress(addr)),
      })
    )
    .query(async (opts) => {
      const exchange = await getExchangeByAddress(opts.input.exchangeAddress)
      const data = exchange?.exchangeId
        ? await getTotalLiquidityForAddress(
            exchange.exchangeId,
            opts.input.providerAddress
          )
        : null
      return data
    }),
  getMatchedEthAmount: publicProcedure
    .input(
      z.object({
        tokenId: z.number(),
        tokenAmount: z.string(),
      })
    )
    .query(async (opts) => {
      return await getMatchedEthAmount(
        opts.input.tokenId,
        opts.input.tokenAmount
      )
    }),
  getMatchedTokenAmount: publicProcedure
    .input(
      z.object({
        tokenId: z.number(),
        ethAmount: z.string(),
      })
    )
    .query(async (opts) => {
      return await getMatchedTokenAmount(
        opts.input.tokenId,
        opts.input.ethAmount
      )
    }),
})

export type AppRouter = typeof appRouter
