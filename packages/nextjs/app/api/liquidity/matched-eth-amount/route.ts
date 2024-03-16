import { getMatchedEthAmount } from '@/db/liquidity'
import { isFinite } from 'lodash-es'

export async function GET(request: Request) {
  const params = new URLSearchParams(request.url)
  const tokenId = Number(params.get('tokenId'))
  const tokenAmount = params.get('tokenAmount')
  if (!isFinite(tokenId) || !tokenAmount) {
    return Response.json({
      status: 'error',
      error: {
        code: 400,
        message: 'Bad Request',
        details: 'Params error',
      },
    })
  }
  const data = await getMatchedEthAmount(tokenId, tokenAmount)
  return Response.json({
    status: 'success',
    data,
  })
}
