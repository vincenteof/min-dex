import { getAllTokensWithExchanges } from '@/db/token'

export async function GET(_: Request) {
  const data = await getAllTokensWithExchanges()
  return Response.json({
    status: 'success',
    data,
  })
}
