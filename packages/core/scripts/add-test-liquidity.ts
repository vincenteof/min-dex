import { Factory, Exchange } from '@/typechain-types'
import { ethers } from 'hardhat'

const toWei = (value: bigint | number) => ethers.parseEther(value.toString())

async function main() {
  const Token = await ethers.getContractFactory('Token')
  const token = await Token.deploy('TokenA', 'AAA', toWei(1000000))
  await token.waitForDeployment()
  console.log(`Token deployed to ${token.target}`)
  const [deployer] = await ethers.getSigners()
  const Factory = await ethers.getContractFactory('Factory')
  const factory = Factory.attach('0x5FbDB2315678afecb367f032d93F642f64180aa3') as Factory
  const tx = await factory.connect(deployer).createExchange(token.target)
  const receipt1 = await tx.wait()
  if (receipt1?.status === 1) {
    console.log("Exchange creation successful");
  } else {
    console.log("Exchange creation failed");
  }
  const exchangeAddress = await factory.getExchange(token.target)
  const Exchange = await ethers.getContractFactory('Exchange')
  const exchange = Exchange.attach(exchangeAddress) as Exchange
  await token.approve(exchange.target, toWei(200))
  const tx2 = await exchange.addLiquidity(toWei(200), { value: toWei(100) })
  const receipt2 = await tx2.wait()
  if (receipt2?.status === 1) {
    console.log("addLiquidity for test token successful");
  } else {
    console.log("addLiquidity for test token failed");
  } 
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
