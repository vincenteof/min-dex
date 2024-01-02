import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { Exchange, Token } from '@/typechain-types'
import { ContractTransactionResponse } from 'ethers'

const toWei = (value: bigint | number) => ethers.parseEther(value.toString())

const fromWei = (value: string | bigint | number) =>
  ethers.formatEther(typeof value === 'string' ? value : value.toString())

const getBalance = ethers.provider.getBalance.bind(ethers.provider)

const getGasFeeFromTx = async (tx: ContractTransactionResponse) => {
  const receipt = await tx.wait()
  if (!receipt) {
    throw new Error('There is something wrong with the transaction')
  }
  const gasUsed = receipt.gasUsed
  const gasPrice = receipt.gasPrice
  return gasUsed * gasPrice
}

describe('addLiquidity', async () => {
  let owner: HardhatEthersSigner
  let user: HardhatEthersSigner
  let token: Token
  let exchange: Exchange

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
    expect(await exchange.name()).to.equal('Web3-From-Scratch')
    expect(await exchange.symbol()).to.equal('W3FS')
    expect(await exchange.totalSupply()).to.equal(toWei(0))
    expect(await exchange.factoryAddress()).to.equal(owner.address)
  })

  describe('addLiquidity', async () => {
    describe('empty reserves', async () => {
      it('adds liquidity', async () => {
        await token.approve(exchange.target, toWei(200))
        await exchange.addLiquidity(toWei(200), { value: toWei(100) })

        expect(await getBalance(exchange.target)).to.equal(toWei(100))
        expect(await exchange.getReserve()).to.equal(toWei(200))
      })

      it('mints LP tokens', async () => {
        await token.approve(exchange.target, toWei(200))
        await exchange.addLiquidity(toWei(200), { value: toWei(100) })

        expect(await exchange.balanceOf(owner.address)).to.eq(toWei(100))
        expect(await exchange.totalSupply()).to.eq(toWei(100))
      })

      it('allows zero amounts', async () => {
        await token.approve(exchange.target, 0)
        await exchange.addLiquidity(0, { value: 0 })

        expect(await getBalance(exchange.target)).to.equal(0)
        expect(await exchange.getReserve()).to.equal(0)
      })
    })

    describe('existing reserves', async () => {
      beforeEach(async () => {
        await token.approve(exchange.target, toWei(300))
        await exchange.addLiquidity(toWei(200), { value: toWei(100) })
      })

      it('preserves exchange rate', async () => {
        await exchange.addLiquidity(toWei(200), { value: toWei(50) })

        expect(await getBalance(exchange.target)).to.equal(toWei(150))
        expect(await exchange.getReserve()).to.equal(toWei(300))
      })

      it('mints LP tokens', async () => {
        await exchange.addLiquidity(toWei(200), { value: toWei(50) })

        expect(await exchange.balanceOf(owner.address)).to.eq(toWei(150))
        expect(await exchange.totalSupply()).to.eq(toWei(150))
      })

      it('fails when not enough tokens', async () => {
        await expect(
          exchange.addLiquidity(toWei(50), { value: toWei(50) })
        ).to.be.revertedWith('insufficient token amount')
      })
    })
  })

  describe('removeLiquidity', async () => {
    beforeEach(async () => {
      await token.approve(exchange.target, toWei(300))
      await exchange.addLiquidity(toWei(200), { value: toWei(100) })
    })

    it('removes some liquidity', async () => {
      const userEtherBalanceBefore = await getBalance(owner.address)
      const userTokenBalanceBefore = await token.balanceOf(owner.address)

      const tx = await exchange.removeLiquidity(toWei(25))
      const gasFee = await getGasFeeFromTx(tx)

      expect(await exchange.getReserve()).to.equal(toWei(150))
      expect(await getBalance(exchange.target)).to.equal(toWei(75))

      const userEtherBalanceAfter = await getBalance(owner.address)
      const userTokenBalanceAfter = await token.balanceOf(owner.address)

      expect(fromWei(userEtherBalanceAfter - userEtherBalanceBefore)).to.equal(
        // 25 - gas fees
        fromWei(toWei(25) - gasFee)
      )

      expect(fromWei(userTokenBalanceAfter - userTokenBalanceBefore)).to.equal(
        '50.0'
      )
    })

    it('removes all liquidity', async () => {
      const userEtherBalanceBefore = await getBalance(owner.address)
      const userTokenBalanceBefore = await token.balanceOf(owner.address)

      const tx = await exchange.removeLiquidity(toWei(100))
      const gasFee = await getGasFeeFromTx(tx)

      expect(await exchange.getReserve()).to.equal(toWei(0))
      expect(await getBalance(exchange.target)).to.equal(toWei(0))

      const userEtherBalanceAfter = await getBalance(owner.address)
      const userTokenBalanceAfter = await token.balanceOf(owner.address)

      expect(fromWei(userEtherBalanceAfter - userEtherBalanceBefore)).to.equal(
        // 100 - gas fees
        fromWei(toWei(100) - gasFee)
      )

      expect(fromWei(userTokenBalanceAfter - userTokenBalanceBefore)).to.equal(
        '200.0'
      )
    })

    it('pays for provided liquidity', async () => {
      const userEtherBalanceBefore = await getBalance(owner.address)
      const userTokenBalanceBefore = await token.balanceOf(owner.address)

      await exchange
        .connect(user)
        .ethToTokenSwap(toWei(18), { value: toWei(10) })

      const tx = await exchange.removeLiquidity(toWei(100))
      const gasFee = await getGasFeeFromTx(tx)

      expect(await exchange.getReserve()).to.equal(toWei(0))
      expect(await getBalance(exchange.target)).to.equal(toWei(0))
      expect(fromWei(await token.balanceOf(user.address))).to.equal(
        '18.01637852593266606'
      )

      const userEtherBalanceAfter = await getBalance(owner.address)
      const userTokenBalanceAfter = await token.balanceOf(owner.address)

      expect(fromWei(userEtherBalanceAfter - userEtherBalanceBefore)).to.equal(
        // 110 - gas fees
        fromWei(toWei(110) - gasFee)
      )

      expect(fromWei(userTokenBalanceAfter - userTokenBalanceBefore)).to.equal(
        '181.98362147406733394'
      )
    })

    it('burns LP-tokens', async () => {
      await expect(() =>
        exchange.removeLiquidity(toWei(25))
      ).to.changeTokenBalance(exchange, owner, toWei(-25))

      expect(await exchange.totalSupply()).to.equal(toWei(75))
    })

    it("doesn't allow invalid amount", async () => {
      await expect(exchange.removeLiquidity(toWei(100.1))).to.be.revertedWith(
        'ERC20: burn amount exceeds balance'
      )
    })
  })

  describe('getTokenAmount', async () => {
    it('returns correct token amount', async () => {
      await token.approve(exchange.target, toWei(2000))
      await exchange.addLiquidity(toWei(2000), { value: toWei(1000) })

      let tokensOut = await exchange.getTokenAmount(toWei(1))
      expect(fromWei(tokensOut)).to.equal('1.978041738678708079')

      tokensOut = await exchange.getTokenAmount(toWei(100))
      expect(fromWei(tokensOut)).to.equal('180.1637852593266606')

      tokensOut = await exchange.getTokenAmount(toWei(1000))
      expect(fromWei(tokensOut)).to.equal('994.974874371859296482')
    })
  })

  describe('getEthAmount', async () => {
    it('returns correct ether amount', async () => {
      await token.approve(exchange.target, toWei(2000))
      await exchange.addLiquidity(toWei(2000), { value: toWei(1000) })

      let ethOut = await exchange.getEthAmount(toWei(2))
      expect(fromWei(ethOut)).to.equal('0.989020869339354039')

      ethOut = await exchange.getEthAmount(toWei(100))
      expect(fromWei(ethOut)).to.equal('47.16531681753215817')

      ethOut = await exchange.getEthAmount(toWei(2000))
      expect(fromWei(ethOut)).to.equal('497.487437185929648241')
    })
  })

  describe('tokenToEthSwap', async () => {
    beforeEach(async () => {
      await token.transfer(user.address, toWei(22))
      await token.connect(user).approve(exchange.target, toWei(22))

      await token.approve(exchange.target, toWei(2000))
      await exchange.addLiquidity(toWei(2000), { value: toWei(1000) })
    })

    it('transfers at least min amount of tokens', async () => {
      const userBalanceBefore = await getBalance(user.address)
      const exchangeBalanceBefore = await getBalance(exchange.target)
      // value without gas fee
      // we must do the calculation before all mutations
      const pureEthBought = await exchange.getEthAmount(toWei(2))
      const tx = await exchange.connect(user).tokenToEthSwap(toWei(2), toWei(0.9))
      const gasFee = await getGasFeeFromTx(tx)

      const userBalanceAfter = await getBalance(user.address)
      expect(fromWei(userBalanceAfter - userBalanceBefore)).to.equal(
        fromWei(pureEthBought - gasFee)
      )

      const userTokenBalance = await token.balanceOf(user.address)
      expect(fromWei(userTokenBalance)).to.equal('20.0')

      const exchangeBalanceAfter = await getBalance(exchange.target)
      // here the exchange doesn't need to pay the gas
      expect(fromWei(exchangeBalanceAfter - exchangeBalanceBefore)).to.equal(
        fromWei(-pureEthBought)
      )

      const exchangeTokenBalance = await token.balanceOf(exchange.target)
      expect(fromWei(exchangeTokenBalance)).to.equal('2002.0')
    })

    it('affects exchange rate', async () => {
      let ethOut = await exchange.getEthAmount(toWei(20))
      expect(fromWei(ethOut)).to.equal('9.802950787206654124')

      await exchange.connect(user).tokenToEthSwap(toWei(20), toWei(9))

      ethOut = await exchange.getEthAmount(toWei(20))
      expect(fromWei(ethOut)).to.equal('9.61167838729939614')
    })

    it('fails when output amount is less than min amount', async () => {
      await expect(
        exchange.connect(user).tokenToEthSwap(toWei(2), toWei(1.0))
      ).to.be.revertedWith('insufficient output amount')
    })

    it('allows zero swaps', async () => {
      const userBalanceBefore = await getBalance(user.address)
      const tx = await exchange.connect(user).tokenToEthSwap(toWei(0), toWei(0))
      const gasFee = await getGasFeeFromTx(tx)

      const userBalanceAfter = await getBalance(user.address)
      expect(fromWei(userBalanceAfter - userBalanceBefore)).to.equal(
        fromWei(toWei(0) - gasFee)
      )

      const userTokenBalance = await token.balanceOf(user.address)
      expect(fromWei(userTokenBalance)).to.equal('22.0')

      const exchangeEthBalance = await getBalance(exchange.target)
      expect(fromWei(exchangeEthBalance)).to.equal('1000.0')

      const exchangeTokenBalance = await token.balanceOf(exchange.target)
      expect(fromWei(exchangeTokenBalance)).to.equal('2000.0')
    })
  })

  describe('tokenToTokenSwap', async () => {
    it('swaps token for token', async () => {
      const Factory = await ethers.getContractFactory('Factory')
      const Token = await ethers.getContractFactory('Token')
      const factory = await Factory.deploy()
      const token = await Token.deploy('TokenA', 'AAA', toWei(1000000))
      const token2 = await Token.connect(user).deploy(
        'TokenB',
        'BBBB',
        toWei(1000000)
      )
      await factory.waitForDeployment()
      await token.waitForDeployment()
      await token2.waitForDeployment()

      const tx = await factory.connect(owner).createExchange(token.target)
      await tx.wait()
      const exchangeAddress = await factory.getExchange(token.target)
      const Exchange = await ethers.getContractFactory('Exchange')
      const exchange = Exchange.attach(exchangeAddress) as Exchange
      const tx2 = await factory.connect(user).createExchange(token2.target)
      await tx2.wait()
      const exchangeAddress2 = await factory.getExchange(token2.target)
      const exchange2 = Exchange.attach(exchangeAddress2) as Exchange

      await token.approve(exchange.target, toWei(2000))
      await exchange.addLiquidity(toWei(2000), { value: toWei(1000) })

      await token2.connect(user).approve(exchange2.target, toWei(1000))
      await exchange2
        .connect(user)
        .addLiquidity(toWei(1000), { value: toWei(1000) })

      expect(await token2.balanceOf(owner.address)).to.equal(0)

      await token.approve(exchange.target, toWei(10))
      await exchange.tokenToTokenSwap(toWei(10), toWei(4.8), token2.target)

      expect(fromWei(await token2.balanceOf(owner.address))).to.equal(
        '4.852698493489877956'
      )

      expect(await token.balanceOf(user.address)).to.equal(0)

      await token2.connect(user).approve(exchange2.target, toWei(10))
      await exchange2
        .connect(user)
        .tokenToTokenSwap(toWei(10), toWei(19.6), token.target)

      expect(fromWei(await token.balanceOf(user.address))).to.equal(
        '19.602080509528011079'
      )
    })
  })
})
