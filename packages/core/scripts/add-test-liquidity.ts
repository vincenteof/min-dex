import { Factory, Exchange } from '@/typechain-types'
import { ethers } from 'hardhat'

const toWei = (value: bigint | number) => ethers.parseEther(value.toString())

const fromWei = (value: string | bigint | number) =>
  ethers.formatEther(typeof value === 'string' ? value : value.toString())

async function main() {
  const token = await ethers.deployContract('Token', [
    'Test Token',
    'TKN',
    31337,
  ])
  await token.waitForDeployment()
  console.log(`Token deployed to ${token.target}`)
  const [deployer, owner] = await ethers.getSigners()
  const Factory = await ethers.getContractFactory('Factory')
  const factory = Factory.attach('0x') as Factory
  const tx = await factory.connect(owner).createExchange(token.target)
  await tx.wait()
  const exchangeAddress = await factory.getExchange(token.target)
  const Exchange = await ethers.getContractFactory('Exchange')
  const exchange = Exchange.attach(exchangeAddress) as Exchange
  await token.approve(exchange.target, toWei(200))
  await exchange.addLiquidity(toWei(200), { value: toWei(100) })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
