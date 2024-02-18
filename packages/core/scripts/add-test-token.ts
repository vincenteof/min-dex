import { ethers } from 'hardhat'

const toWei = (value: bigint | number) => ethers.parseEther(value.toString())

async function main() {
  const Token = await ethers.getContractFactory('Token')
  const token = await Token.deploy('PengPengCoin', 'PPC', toWei(1000000))
  await token.waitForDeployment()
  console.log(`Token deployed to ${token.target}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
