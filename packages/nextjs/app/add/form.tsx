'use client'

import TokenSelectDialog from '@/components/token-select-dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Token } from '@min-dex/db'
import { useForm } from 'react-hook-form'
import {
  ContractFunctionExecutionError,
  formatEther,
  isAddress,
  parseEther,
} from 'viem'
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'
import { z } from 'zod'
import Core from '@min-dex/core-abi'
import { toast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import useApproveTokenAllowance from '@/hooks/useApproveTokenAllowance'
import OnChainOpButton from '@/components/on-chain-op-button'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'

const formSchema = z.object({
  token: z
    .object({
      tokenId: z.number().positive(),
      tokenAddress: z
        .string()
        .min(1, {
          message: '代币合约地址不能为空',
        })
        .refine((data) => isAddress(data), {
          message: '代币合约地址不合法',
        }),
      exchangeAddress: z
        .string()
        .min(1, {
          message: '交易所合约地址不能为空',
        })
        .refine((data) => isAddress(data), {
          message: '交易所合约地址不合法',
        }),
    })
    .nullable(),
  tokenAmount: z.string(),
  ethAmount: z.string(),
})

// todo: default value and schema validation
export default function AddLiquidityForm(props: {
  defaultToken: Token | null
}) {
  const { defaultToken } = props
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: defaultToken,
      tokenAmount: '0',
      ethAmount: '0',
    },
  })

  const currentAccount = useAccount()
  const tokenValue = form.watch('token')
  const tokenAddressValue = tokenValue?.tokenAddress as
    | `0x${string}`
    | undefined
  const exchangeAddressValue = tokenValue?.exchangeAddress as
    | `0x${string}`
    | undefined

  const tokenAmountValue = form.watch('tokenAmount') ?? '0'

  const { allowance, approve, isApproving } = useApproveTokenAllowance(
    currentAccount.address,
    tokenAddressValue,
    exchangeAddressValue,
    tokenAmountValue
  )

  const {
    writeAsync,
    data,
    isLoading: addLiquidityLoading,
  } = useContractWrite({
    abi: Core.Exchange.abi,
    functionName: 'addLiquidity',
    address: exchangeAddressValue,
    onError: (err) => {
      toast({
        variant: 'destructive',
        title: '增加流动性失败',
        description:
          (err as ContractFunctionExecutionError)?.shortMessage ?? err?.message,
      })
    },
  })

  const { isLoading: addLiquidityTxLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      toast({
        description: '流动性添加成功',
      })
      setTimeout(() => {
        router.push('/pools')
      }, 1500)
    },
  })

  const { mutate: getMatchedEthAmount } = useMutation({
    mutationFn: async (params: { tokenId: string; tokenAmount: string }) => {
      const queryString = new URLSearchParams(params).toString()
      const res = await fetch(
        `/api/liquidity/matched-eth-amount?${queryString}`
      )
      if (!res.ok) {
        throw new Error('Network response is not ok')
      }
      return res.json()
    },
    onSuccess: (res) => {
      if (res.status !== 'success') {
        toast({
          variant: 'destructive',
          title: '获取对应以太币数量失败',
          description: res.error.message,
        })
      }
      if (res.data === null) {
        return
      }
      const matchedEthAmount = formatEther(BigInt(res.data))
      form.setValue('ethAmount', matchedEthAmount)
    },
    onError: (err) => {
      console.log(err)
      toast({
        variant: 'destructive',
        title: '获取对应以太币数量失败',
      })
    },
  })
  const { mutate: getMatchedTokenAmount } = useMutation({
    mutationFn: async (params: { tokenId: string; ethAmount: string }) => {
      const queryString = new URLSearchParams(params).toString()
      const res = await fetch(
        `/api/liquidity/matched-token-amount?${queryString}`
      )
      if (!res.ok) {
        throw new Error('Network response is not ok')
      }
      return res.json()
    },
    onSuccess: (res) => {
      if (res.status !== 'success') {
        toast({
          variant: 'destructive',
          title: '获取对代币数量失败',
          description: res.error.message,
        })
      }
      if (res.data === null) {
        return
      }
      const matchedTokenAmount = formatEther(BigInt(res.data))
      form.setValue('tokenAmount', matchedTokenAmount)
    },
    onError: (res) => {
      toast({
        variant: 'destructive',
        title: '获取对应代币数量失败',
        description: res.message,
      })
    },
  })

  if (isApproving) {
    return (
      <div className="flex flex-col space-y-9">
        <div>
          <Skeleton className="h-[20px] mb-2 w-1/3" />
          <Skeleton className="h-[40px] w-full" />
        </div>
        <div>
          <Skeleton className="h-[20px] mb-2 w-1/3" />
          <Skeleton className="h-[40px] w-full" />
        </div>
        <div>
          <Skeleton className="h-[20px] mb-2 w-1/3" />
          <Skeleton className="h-[40px] w-full" />
        </div>
        <Skeleton className="h-[44px] w-full" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          if (!allowance || allowance < parseEther(tokenAmountValue)) {
            approve?.()
            // todo: add message to tell user to add allowance
            toast({
              variant: 'destructive',
              title: '请先完成代币额度授权',
            })
            return Promise.reject(
              new Error('No sufficient allowance for token')
            )
          }
          return writeAsync({
            args: [parseEther(values.tokenAmount)],
            value: parseEther(values.ethAmount),
          })
        })}
        className="space-y-9"
      >
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>代币</FormLabel>
              <FormControl>
                <TokenSelectDialog
                  value={field.value as unknown as Token}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                你可以选择对应的代币或直接输入其合约地址
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tokenAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>代币数量</FormLabel>
              <FormControl>
                <Input
                  placeholder="0"
                  type="number"
                  {...field}
                  onBlur={(e) => {
                    if (tokenValue?.tokenId) {
                      const value = e.currentTarget.value
                      getMatchedEthAmount({
                        tokenId: tokenValue.tokenId.toString(),
                        tokenAmount: parseEther(value).toString(),
                      })
                    }
                    field.onBlur()
                  }}
                />
              </FormControl>
              <FormDescription>本次流动性提供所对应的代币数量</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ethAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>以太币数量</FormLabel>
              <FormControl>
                <Input
                  placeholder="0"
                  type="number"
                  {...field}
                  onBlur={(e) => {
                    if (tokenValue?.tokenId) {
                      const value = e.currentTarget.value
                      getMatchedTokenAmount({
                        tokenId: tokenValue.tokenId.toString(),
                        ethAmount: parseEther(value).toString(),
                      })
                    }
                    field.onChange(e)
                  }}
                />
              </FormControl>
              <FormDescription>
                本次流动性提供所对应的以太币数量
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* todo: 等待 allowance 类似 uniswap 的效果 */}
        <OnChainOpButton
          type="submit"
          size="lg"
          className="w-full"
          isSubmitting={addLiquidityLoading}
          isWaitingForConfirmation={addLiquidityTxLoading}
          submittingContent="提交中..."
          waitingContent="等待交易完成..."
        >
          提交
        </OnChainOpButton>
      </form>
    </Form>
  )
}
