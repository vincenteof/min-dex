import { HardhatUserConfig } from 'hardhat/config'
import { config } from 'dotenv'
import '@nomicfoundation/hardhat-toolbox'
// import 'hardhat-ethernal'

config()

if (process.env.ENABLE_ETHERNAL === '1') {
  import('hardhat-ethernal')
}

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
      mining: {
        auto: true,
        interval: 3 * 60 * 1000, // should be less then 5 minutes to make event subscription work
      },
    },
  },
  ethernal:
    process.env.ENABLE_ETHERNAL === '1'
      ? {
          apiToken: process.env.ETHERNAL_API_TOKEN as string,
          disableSync: false,
          disableTrace: false,
          uploadAst: false,
          disabled: false,
        }
      : undefined,
}

export default hardhatConfig
