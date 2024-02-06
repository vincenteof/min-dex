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

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

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

factoryContract.on(
  'LiquidityAdded',
  (exchangeAddress: string, tokenAddress: string, providerAddress: string, tokenAmount: BigInt, ethAmount: BigInt) => {
    console.log(
      `Exchange Created - Token: ${tokenAddress}, Exchange: ${exchangeAddress}`
    )
    handleLiquidityAddedEvent(
      tokenAddress,
      exchangeAddress,
      providerAddress,
      tokenAmount,
      ethAmount
    )
  }
)

factoryContract.on(
  'LiquidityRemoved',
  (exchangeAddress: string, tokenAddress: string, providerAddress: string, tokenAmount: BigInt, ethAmount: BigInt) => {
    console.log(
      `Exchange Created - Token: ${tokenAddress}, Exchange: ${exchangeAddress}`
    )
    handleLiquidityRemovedEvent(
      tokenAddress,
      exchangeAddress,
      providerAddress,
      tokenAmount,
      ethAmount
    )
  }
)
