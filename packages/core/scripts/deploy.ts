import { ethers } from 'hardhat'

async function main() {
  const factory = await ethers.deployContract('Factory', [])
  await factory.waitForDeployment()
  console.log(`Factory deployed to ${factory.target}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
