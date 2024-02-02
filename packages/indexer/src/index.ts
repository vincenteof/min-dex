import { ethers } from 'ethers'
import { config } from 'dotenv'
import Core from '@web3-from-scratch/core-abi'

config()

const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL)
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const factoryContract = new ethers.Contract(CONTRACT_ADDRESS, Core.Factory.abi, provider)

factoryContract.on('ExchangeCreated', (tokenAddress, exchangeAddress) => {
  console.log(
    `Exchange Created - Token: ${tokenAddress}, Exchange: ${exchangeAddress}`
  )
})
