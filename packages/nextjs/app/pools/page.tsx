import OperationDropdownMenu from './operation-dropdown-menu'
import PositionsContainer from './positions-container'
import PositionsList from './positions-list'

export default async function Pools({
  searchParams,
}: {
  searchParams?: { providerAddress?: string }
}) {
  const providerAddress = searchParams?.providerAddress ?? ''
  return (
    <section className="w-full max-w-3xl pt-12 flex flex-col gap-6">
      <div className="w-full flex items-center justify-between">
        <div className="text-3xl font-bold">流动池</div>
        <OperationDropdownMenu />
      </div>
      <PositionsContainer>
        <PositionsList address={providerAddress} />
      </PositionsContainer>
    </section>
  )
}
