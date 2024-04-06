'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { Token } from '@min-dex/db'

export default function TokenSelectDialog(props: {
  onChange?: (token: Token[]) => void
  value?: Token | null
}) {
  const { onChange, value } = props
  const { data: queriedTokens = [] } = useQuery({
    queryFn: async () => {
      const res = await fetch('/api/token')
      if (!res.ok) {
        throw new Error('Network response is not ok')
      }
      return res.json()
    },
    queryKey: ['/api/token'],
    select: (res) => {
      if (res.status !== 'success') {
        return []
      }
      return res.data
    },
  })
  const tokens = queriedTokens ?? []
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <Select value={value?.tokenSymbol ?? undefined}>
            <SelectTrigger>
              <SelectValue placeholder="选择代币">
                {value?.tokenSymbol}
              </SelectValue>
            </SelectTrigger>
          </Select>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>选择代币</DialogTitle>
          <DialogDescription> </DialogDescription>
        </DialogHeader>
        <div>
          <Input placeholder="搜索名称或粘贴地址" />
          <Separator className="my-6" />
          <div className="text-sm text-muted-foreground pb-6">热门代币</div>
          <ScrollArea className="w-full h-[360px]">
            {tokens.map((token) => {
              const isSelected =
                value && token.tokenAddress === value.tokenAddress
              return (
                <DialogClose key={token.tokenId} asChild>
                  <div
                    className={clsx(
                      'p-4 rounded-sm flex hover:bg-slate-100 hover:cursor-pointer',
                      isSelected && 'opacity-40'
                    )}
                    onClick={() => {
                      onChange?.(token)
                    }}
                  >
                    {/* todo: nextjs Image has error */}
                    <img
                      className="w-[35px] h-[36px] rounded-full mr-4"
                      src="https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x111111111117dC0aa78b770fA6A738034120C302/logo.png"
                      alt={`${token.tokenSymbol}-logo`}
                    />
                    <div className="text-xs text-ellipsis">
                      <div>{token.tokenName}</div>
                      <div className="text-slate-501 mt-1">
                        {token.tokenSymbol}
                      </div>
                    </div>
                  </div>
                </DialogClose>
              )
            })}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
