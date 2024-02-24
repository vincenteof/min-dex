"use client"

import TokenSelectDialog from '@/components/token-select-dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { isAddress } from 'viem'
import { z } from 'zod'

const formSchema = z.object({
  tokenAddress: z
    .string()
    .min(1, {
      message: '代币合约地址不能为空',
    })
    .refine((data) => isAddress(data), {
      message: '代币合约地址不合法',
    }),
  tokenAmount: z.string()
})

export default function AddLiq() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenAddress: '',
      tokenAmount: ''
    },
  })

  const onSubmit = () => {}
  return (
    <section className="w-full max-w-2xl pt-12 flex flex-col gap-6">
      <div className="w-full flex items-center justify-between">
        <div className="text-3xl font-bold">增加流动性</div>
      </div>
      <div className="border rounded-2xl flex flex-col p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="tokenAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>代币</FormLabel>
                  <FormControl>
                    <TokenSelectDialog value={field.value} onChange={field.onChange}/>
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
            <Button type="submit" size="lg" className='w-full'>提交</Button>
          </form>
        </Form>
      </div>
    </section>
  )
}
