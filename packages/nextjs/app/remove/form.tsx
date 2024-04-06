'use client'

import OnChainOpButton from '@/components/on-chain-op-button'
import TokenSelectDialog from '@/components/token-select-dialog'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Token } from '@min-dex/db'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { isAddress } from 'viem/utils'
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'
import Core from '@min-dex/core-abi'
import { z } from 'zod'
import { toast } from '@/components/ui/use-toast'
import { ContractFunctionExecutionError } from 'viem'
import { useRouter } from 'next/navigation'

const defaultFormSchema = z.object({
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
  liquidity: z.string(),
})

type FormSchemaType = typeof defaultFormSchema

export default function RemoveLiquidityForm(props: {
  defaultToken: Token | null
}) {
  const { defaultToken } = props
  const router = useRouter()
  const [formSchema, setFormSchema] =
    useState<FormSchemaType>(defaultFormSchema)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: defaultToken,
      liquidity: '0',
    },
  })
  const tokenValue = form.watch('token')
  const { address } = useAccount()
  const params = {
    exchangeAddress: tokenValue?.exchangeAddress ?? '',
    providerAddress: address ?? '',
  }
  const { data: totalLiquidity } = useQuery({
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString()
      const res = await fetch(`/api/liquidity/total?${queryString}`)
      if (!res.ok) {
        throw new Error('Network response is not ok')
      }
      return res.json()
    },
    queryKey: ['/api/liquidity/total', params],
    select: (res) => {
      if (res.status !== 'success') {
        return null
      }
      return res.data
    },
    enabled: Boolean(params.exchangeAddress && params.providerAddress),
  })

  useEffect(() => {
    if (totalLiquidity) {
      const newFormSchema = z.object({
        token: defaultFormSchema.shape.token,
        liquidity: defaultFormSchema.shape.liquidity.refine((val) => {
          const totalLiquidityVal = BigInt(totalLiquidity)
          const liquidityVal = BigInt(val)
          return liquidityVal <= totalLiquidityVal
        }, '流动性需合法且小于最大值'),
      })
      // todo: seems that add a refine function changes the typing of a zod schema
      setFormSchema(newFormSchema as unknown as FormSchemaType)
    }
  }, [totalLiquidity])

  const {
    writeAsync,
    data,
    isLoading: removeLiquidityLoading,
  } = useContractWrite({
    abi: Core.Exchange.abi,
    functionName: 'removeLiquidity',
    address: tokenValue?.exchangeAddress as `0x${string}` | undefined,
    onError: (err) => {
      toast({
        variant: 'destructive',
        title: '移除流动性失败',
        description:
          (err as ContractFunctionExecutionError)?.shortMessage ?? err?.message,
      })
    },
  })

  const { isLoading: removeLiquidityTxLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      toast({
        description: '流动性移除成功',
      })
      setTimeout(() => {
        router.push('/pools')
      }, 1500)
    },
  })

  return (
    <Form {...form}>
      <form
        className="space-y-9"
        onSubmit={form.handleSubmit((values) => {
          writeAsync({
            args: [BigInt(values.liquidity)],
          })
        })}
      >
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>代币</FormLabel>
              <FormControl>
                <TokenSelectDialog
                  // todo: fix it
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
          name="liquidity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>流动性份额</FormLabel>
              <FormControl>
                <div className="flex w-full items-center space-x-2">
                  <Input placeholder="0" type="number" {...field} />
                  {totalLiquidity ? (
                    <Button
                      variant="link"
                      onClick={(e) => {
                        e.preventDefault()
                        form.setValue('liquidity', totalLiquidity)
                      }}
                    >
                      最大
                    </Button>
                  ) : null}
                </div>
              </FormControl>
              <FormDescription>需要移除的流动性份额</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <OnChainOpButton
          type="submit"
          size="lg"
          className="w-full"
          isSubmitting={removeLiquidityLoading}
          isWaitingForConfirmation={removeLiquidityTxLoading}
          submittingContent="提交中..."
          waitingContent="等待交易完成..."
        >
          提交
        </OnChainOpButton>
      </form>
    </Form>
  )
}
