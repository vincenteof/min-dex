import { getTokenById } from '@/db/token'
import Form from './form'

export default async function AddLiquidity({
  searchParams,
}: {
  searchParams?: { tokenId?: string }
}) {
  const tokenId = Number(searchParams?.tokenId)
  const token = isFinite(tokenId) ? await getTokenById(tokenId) : null
  return (
    <section className="w-full max-w-2xl pt-12 flex flex-col gap-6">
      <div className="w-full flex items-center justify-between">
        <div className="text-3xl font-bold">增加流动性</div>
      </div>
      <div className="border rounded-2xl flex flex-col p-6">
        <Form defaultToken={token} />
      </div>
    </section>
  )
}
