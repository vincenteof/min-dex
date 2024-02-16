'use client'

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
import { useForm } from 'react-hook-form'
import { isAddress } from 'viem'
import { useContractWrite, useNetwork } from 'wagmi'
import { ReloadIcon } from '@radix-ui/react-icons'
import { z } from 'zod'
import Core from '@web3-from-scratch/core-abi'
import Contracts from '@/lib/contracts'
import { useToast } from '@/components/ui/use-toast'

const formSchema = z.object({
  tokenAddress: z
    .string()
    .min(1, {
      message: '代币合约地址不能为空',
    })
    .refine((data) => isAddress(data), {
      message: '代币合约地址不合法',
    }),
})

export default function CreateExchange() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenAddress: '',
    },
  })
  const { chain } = useNetwork()
  const factoryAddress = chain?.id ? Contracts[chain.id].Factory.address : '0x'
  const { toast } = useToast()
  const { write, isLoading } = useContractWrite({
    address: factoryAddress,
    abi: Core.Factory.abi,
    functionName: 'createExchange',
    onSuccess: () => {
      toast({
        description: '交易所创建成功',
      })
    },
    onError: (err) => {
      toast({
        variant: 'destructive',
        description: '交易所创建失败',
      })
    },
  })
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    write({
      args: [values.tokenAddress as `0x${string}`],
    })
  }

  return (
    <section className="w-full max-w-3xl pt-12 flex flex-col gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="tokenAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>代币地址</FormLabel>
                <FormControl>
                  <Input placeholder="0x" {...field} />
                </FormControl>
                <FormDescription>请输入需要关联的代币合约地址</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            提交
          </Button>
        </form>
      </Form>
    </section>
  )
}