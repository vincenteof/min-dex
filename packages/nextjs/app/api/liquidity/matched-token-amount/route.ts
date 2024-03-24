import { getMatchedTokenAmount } from '@/db/liquidity'
import { isFinite } from 'lodash-es'

// todo: make the calling type safe
export async function GET(request: Request) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const tokenId = Number(searchParams.get('tokenId'))
  const ethAmount = searchParams.get('ethAmount')
  if (!isFinite(tokenId) || !ethAmount) {
    return Response.json({
      status: 'error',
      error: {
        code: 400,
        message: 'Bad Request',
        details: 'Params error',
      },
    })
  }
  const data = await getMatchedTokenAmount(tokenId, ethAmount)
  return Response.json({
    status: 'success',
    data,
  })
}
