import { HardhatUserConfig } from 'hardhat/config'
import { config } from 'dotenv'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-ethernal'

config()

const hardhatConfig: HardhatUserConfig = {
  solidity: '0.8.19',
  networks: {
    hardhat: {
      accounts: [
        {
          privateKey: process.env.TEST_ACCOUNT_PRIVATE_KEY as string,
          balance: '100000000000000000000',
        },
      ],
    },
  },
  ethernal: {
    apiToken: process.env.ETHERNAL_API_TOKEN as string,
    disableSync: false,
    disableTrace: false,
    uploadAst: false,
    disabled: false,
  },
}

export default hardhatConfig
