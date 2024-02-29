'use client'

import TokenSelectDialog from '@/components/token-select-dialog'
import { Button } from '@/components/ui/button'
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
import { Exchange, Token } from '@web3-from-scratch/db'
import { useForm } from 'react-hook-form'
import { ContractFunctionExecutionError, isAddress, parseEther } from 'viem'
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import { z } from 'zod'
import Core from '@web3-from-scratch/core-abi'
import { useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'

const formSchema = z.object({
  tokenAddress: z
    .string()
    .min(1, {
      message: '代币合约地址不能为空',
    })
    .refine((data) => isAddress(data), {
      message: '代币合约地址不合法',
    }),
  tokenAmount: z.string(),
  ethAmount: z.string(),
})


// todo: add defensive operation and enhance ux
export default function AddLiquidityForm(props: {
  tokens: (Token & { exchanges: Exchange[] })[]
}) {
  const { tokens } = props
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenAddress: '',
      tokenAmount: '0',
      ethAmount: '0',
    },
  })
  const [exchangeAddress, setExchangeAddress] = useState<
    `0x${string}` | undefined
  >(undefined)
  const { writeAsync } = useContractWrite({
    abi: Core.Exchange.abi,
    functionName: 'addLiquidity',
    address: exchangeAddress,
    onError: (err) => {
      toast({
        variant: 'destructive',
        title: '增加流动性失败',
        description:
          (err as ContractFunctionExecutionError)?.shortMessage ?? err?.message,
      })
    },
  })

  const currentAccount = useAccount()
  const tokenAddressValue = form.watch('tokenAddress') as `0x${string}`
  useEffect(() => {
    const tokenDetail = tokens.find((x) => x.tokenAddress === tokenAddressValue)
    console.log('tokenDetail: ', tokenDetail)
    setExchangeAddress(
      tokenDetail?.exchanges?.[0]?.exchangeAddress as `0x${string}`
    )
  }, [tokenAddressValue, tokens])

  const { data: allowance, refetch } = useContractRead({
    address: tokenAddressValue,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [currentAccount.address as `0x${string}`, exchangeAddress as `0x${string}`],
    enabled: Boolean(currentAccount.address && exchangeAddress) 
  })

  const tokenAmountValue = form.watch('tokenAmount') || '0'
  const { config } = usePrepareContractWrite({
    address: tokenAddressValue,
    abi: erc20ABI,
    functionName: 'approve',
    args: [exchangeAddress as `0x${string}`, parseEther(tokenAmountValue)],
    enabled: Boolean(exchangeAddress)
  })

  const {
    data: writeContractResult,
    writeAsync: approveAsync,
    error,
  } = useContractWrite(config)

  const { isLoading: isApproving } = useWaitForTransaction({
    hash: writeContractResult ? writeContractResult.hash : undefined,
    onSuccess(data) {
      refetch()
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          if (!allowance) {
            approveAsync?.()
            return Promise.reject('No allowance for token')
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
          name="tokenAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>代币</FormLabel>
              <FormControl>
                <TokenSelectDialog
                  value={field.value}
                  onChange={field.onChange}
                  tokens={tokens}
                />
              </FormControl>
              <FormDescription>请选择想添加的代币</FormDescription>
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
                <Input placeholder="0" {...field} />
              </FormControl>
              <FormDescription>请输入想添加的代币数量</FormDescription>
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
                <Input placeholder="0" {...field} />
              </FormControl>
              <FormDescription>请输入想添加的以太币数量</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={form.formState.isSubmitting}
        >
          提交
        </Button>
      </form>
    </Form>
  )
}
