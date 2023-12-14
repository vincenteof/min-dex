import { expect } from 'chai'
import { ethers } from 'hardhat'

const toWei = (value: number) => ethers.parseEther(value.toString())

const fromWei = (value: string | number) =>
  ethers.formatEther(typeof value === 'string' ? value : value.toString())

const getBalance = ethers.provider.getBalance

describe('addLiquidity', async () => {
  // todo: make contract instance type safe
  let owner: any
  let user: any
  let token: any
  let exchange: any

  beforeEach(async () => {
    const signers = await ethers.getSigners()
    owner = signers[0]
    user = signers[1]
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('Token', 'TKN', toWei(1000000))
    await token.deployed()

    const Exchange = await ethers.getContractFactory('Exchange')
    exchange = await Exchange.deploy(token.address)
    await exchange.deployed()
  })

  it('is deployed', async () => {
    expect(await exchange.deployed()).to(exchange)
  })

  it('adds liquidity', async () => {
    await token.approve(exchange.address, toWei(200))
    await exchange.addLiquidity(toWei(200), { value: toWei(100) })

    expect(await getBalance(exchange.address)).to.equal(toWei(100))
    expect(await exchange.getReserve()).to.equal(toWei(200))
  })
})
