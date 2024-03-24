import { ethers, network } from 'hardhat'

async function main() {
  const chainIdHex = await network.provider.send("eth_chainId");
  const chainId = parseInt(chainIdHex, 16);
  console.log(`Deploying to chain ID: ${chainId}`);
  const factory = await ethers.deployContract('Factory', [])
  await factory.waitForDeployment()
  console.log(`Factory deployed to ${factory.target}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
