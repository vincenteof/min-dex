import { ethers } from 'ethers'
import { config } from 'dotenv'
import Core from '@web3-from-scratch/core-abi'
import { provider } from './lib/ethers'
import {
  handleCreateExchangeEvent,
  handleLiquidityAddedEvent,
  handleLiquidityRemovedEvent,
} from './handler'

config()

const CONTRACT_ADDRESS = '0xF4B4fCFC32BE102D0065D0E5F5cE891A49c5DfE8'

const factoryContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  Core.Factory.abi,
  provider
)

factoryContract.on('ExchangeCreated', (tokenAddress: string, exchangeAddress: string) => {
  console.log(
    `Exchange Created - Token: ${tokenAddress}, Exchange: ${exchangeAddress}`
  )
  handleCreateExchangeEvent(tokenAddress, exchangeAddress)
})

// todo: these events is not triggered by Factory contract
// factoryContract.on(
//   'LiquidityAdded',
//   (exchangeAddress: string, tokenAddress: string, providerAddress: string, tokenAmount: BigInt, ethAmount: BigInt) => {
//     console.log(
//       `Exchange Created - Token: ${tokenAddress}, Exchange: ${exchangeAddress}`
//     )
//     handleLiquidityAddedEvent(
//       tokenAddress,
//       exchangeAddress,
//       providerAddress,
//       tokenAmount,
//       ethAmount
//     )
//   }
// )

// factoryContract.on(
//   'LiquidityRemoved',
//   (exchangeAddress: string, tokenAddress: string, providerAddress: string, tokenAmount: BigInt, ethAmount: BigInt) => {
//     console.log(
//       `Exchange Created - Token: ${tokenAddress}, Exchange: ${exchangeAddress}`
//     )
//     handleLiquidityRemovedEvent(
//       tokenAddress,
//       exchangeAddress,
//       providerAddress,
//       tokenAmount,
//       ethAmount
//     )
//   }
// )
