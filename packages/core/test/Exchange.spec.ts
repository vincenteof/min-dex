import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { Exchange, Token } from '@/typechain-types'

const toWei = (value: bigint | number) => ethers.parseEther(value.toString())

const fromWei = (value: string | bigint | number) =>
  ethers.formatEther(typeof value === 'string' ? value : value.toString())

const getBalance = ethers.provider.getBalance.bind(ethers.provider)

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

  describe("getTokenAmount", async () => {
    it("returns correct token amount", async () => {
      await token.approve(exchange.target, toWei(2000));
      await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });

      let tokensOut = await exchange.getTokenAmount(toWei(1));
      expect(fromWei(tokensOut)).to.equal("1.978041738678708079");

      tokensOut = await exchange.getTokenAmount(toWei(100));
      expect(fromWei(tokensOut)).to.equal("180.1637852593266606");

      tokensOut = await exchange.getTokenAmount(toWei(1000));
      expect(fromWei(tokensOut)).to.equal("994.974874371859296482");
    });
  });

  describe("getEthAmount", async () => {
    it("returns correct ether amount", async () => {
      await token.approve(exchange.target, toWei(2000));
      await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });

      let ethOut = await exchange.getEthAmount(toWei(2));
      expect(fromWei(ethOut)).to.equal("0.989020869339354039");

      ethOut = await exchange.getEthAmount(toWei(100));
      expect(fromWei(ethOut)).to.equal("47.16531681753215817");

      ethOut = await exchange.getEthAmount(toWei(2000));
      expect(fromWei(ethOut)).to.equal("497.487437185929648241");
    });
  });
})
