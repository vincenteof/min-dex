import { expect } from 'chai'
import { ethers } from 'hardhat'

const toWei = (value: number) => ethers.parseEther(value.toString())

const fromWei = (value: string | number) =>
  ethers.formatEther(typeof value === 'string' ? value : value.toString())

const getBalance = ethers.provider.getBalance.bind(ethers.provider)

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
    await token.waitForDeployment()

    const Exchange = await ethers.getContractFactory('Exchange')
    exchange = await Exchange.deploy(token.target)
    await exchange.waitForDeployment()
  })

  it('is deployed', async () => {
    expect(await exchange.waitForDeployment()).to.equal(exchange)
  })

  describe('addLiquidity', async () => {
    it('adds liquidity', async () => {
      await token.approve(exchange.target, toWei(200))
      await exchange.addLiquidity(toWei(200), { value: toWei(100) })
      expect(await getBalance(exchange.target)).to.equal(toWei(100))
      expect(await exchange.getReserve()).to.equal(toWei(200))
    })
  })

  describe('getTokenAmount', async () => {
    it('returns correct token amount', async () => {
      await token.approve(exchange.target, toWei(2000))
      await exchange.addLiquidity(toWei(2000), { value: toWei(1000) })
      let tokenAmount = await exchange.getTokenAmount(toWei(1))
      expect(fromWei(tokenAmount)).to.equal('1.998001998001998001')
      tokenAmount = await exchange.getTokenAmount(toWei(100))
      expect(fromWei(tokenAmount)).to.equal('181.818181818181818181')
      tokenAmount = await exchange.getTokenAmount(toWei(1000))
      expect(fromWei(tokenAmount)).to.equal('1000.0')
    })
  })

  describe('getEthAmount', async () => {
    it('returns correct eth amount', async () => {
      await token.approve(exchange.target, toWei(2000))
      await exchange.addLiquidity(toWei(2000), { value: toWei(1000) })
      let ethAmount = await exchange.getEthAmount(toWei(2))
      expect(fromWei(ethAmount)).to.equal('0.999000999000999')
      ethAmount = await exchange.getEthAmount(toWei(100))
      expect(fromWei(ethAmount)).to.equal('47.619047619047619047')
      ethAmount = await exchange.getEthAmount(toWei(2000))
      expect(fromWei(ethAmount)).to.equal('500.0')
    })
  })
})
