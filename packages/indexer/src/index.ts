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

factoryContract.on(
  'ExchangeCreated',
  (tokenAddress: string, exchangeAddress: string) => {
    console.log(
      `Exchange Created - Token: ${tokenAddress}, Exchange: ${exchangeAddress}`
    )
    handleCreateExchangeEvent(tokenAddress, exchangeAddress)
    const exchangeContract = new ethers.Contract(
      exchangeAddress,
      Core.Exchange.abi,
      provider
    )
    exchangeContract.on(
      'LiquidityAdded',
      (
        _0: string,
        _1: string,
        actionProvider: string,
        liquidity: BigInt,
        tokenAmount: BigInt,
        ethAmount: BigInt
      ) => {
        console.log('Liquidity Added')
        handleLiquidityAddedEvent(
          exchangeAddress,
          tokenAddress,
          actionProvider,
          liquidity,
          tokenAmount,
          ethAmount
        )
      }
    )
    exchangeContract.on(
      'LiquidityRemoved',
      (
        _0: string,
        _1: string,
        actionProvider: string,
        liquidity: BigInt,
        tokenAmount: BigInt,
        ethAmount: BigInt
      ) => {
        console.log('Liquidity Removed')
        handleLiquidityRemovedEvent(
          exchangeAddress,
          tokenAddress,
          actionProvider,
          liquidity,
          tokenAmount,
          ethAmount
        )
      }
    )
  }
)
