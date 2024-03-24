import { ethers } from 'hardhat'
import { config } from 'dotenv'

config()

const toWei = (value: bigint | number) => ethers.parseEther(value.toString())

const INITIAL_SUPPLY = 1000000

async function main() {
  const Token = await ethers.getContractFactory('Token')
  const token = await Token.deploy(
    'PengPengCoin',
    'PPC',
    toWei(INITIAL_SUPPLY)
  )
  await token.waitForDeployment()
  console.log(`Token deployed to ${token.target}`)
  await token.transfer(
    process.env.TEST_ACCOUNT_ADDRESS as string,
    toWei(INITIAL_SUPPLY)
  )
  console.log(
    `${INITIAL_SUPPLY} tokens transferred to ${process.env.TEST_ACCOUNT_ADDRESS}`
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
