import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  // Missing this causes hardhat-deploy not creating deployments files
  defaultNetwork: "localhost",
}

export default config
