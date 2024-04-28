import { parseEther, isAddress } from 'viem'
import {
  erc20ABI,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

export default function useApproveTokenAllowance(
  accountAddress: `0x${string}` = '0x',
  tokenAddress: `0x${string}` = '0x',
  exchangeAddress: `0x${string}` = '0x',
  tokenAmount: string
) {
  const { data: allowance, refetch } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [accountAddress, exchangeAddress],
    enabled:
      isAddress(tokenAddress) &&
      isAddress(accountAddress) &&
      isAddress(exchangeAddress),
  })

  const { config } = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
    args: [exchangeAddress, parseEther(tokenAmount)],
    enabled: isAddress(tokenAddress) && isAddress(exchangeAddress),
  })
  const {
    data: writeContractResult,
    writeAsync: approveAsync,
    write: approve,
    error,
  } = useContractWrite(config)

  const { isLoading: isTxLoading } = useWaitForTransaction({
    hash: writeContractResult ? writeContractResult.hash : undefined,
    onSuccess() {
      refetch()
    },
  })

  return {
    allowance,
    approveAsync,
    approve,
    error,
    isApproving: isTxLoading,
  }
}
