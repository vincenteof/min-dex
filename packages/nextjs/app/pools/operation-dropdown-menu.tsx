'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'

export default function OperationDropdownMenu() {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button>+ 新建</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            router.push('/create-exchange')
          }}
        >
          交易所
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            router.push('/add')
          }}
        >
          仓位
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
