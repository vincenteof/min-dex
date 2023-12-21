import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import { Token } from '@/typechain-types'

describe('Token', () => {
  let owner: HardhatEthersSigner
  let token: Token
  before(async () => {
    const signers = await ethers.getSigners()
    owner = signers[0]
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('Test Token', 'TKN', 31337)
    await token.waitForDeployment()
  })

  it('sets name and symbol when created', async () => {
    expect(await token.name()).to.equal('Test Token')
    expect(await token.symbol()).to.equal('TKN')
  })

  it('mints initialSupply to msg.sender when created', async () => {
    expect(await token.totalSupply()).to.equal(31337)
    expect(await token.balanceOf(owner.address)).to.equal(31337)
  })
})
