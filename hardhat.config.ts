import "@typechain/hardhat"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-ethers"
import "hardhat-gas-reporter"
import "dotenv/config"
import "solidity-coverage"
import "hardhat-deploy"
import "solidity-coverage"
import { HardhatUserConfig } from "hardhat/config"

const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "8db29bbd91911b585f9fdf89b1e7d43bf2c17f5ea5a1ae844d7880000563709e"
  
  const config: HardhatUserConfig = {
    // solidity: "0.8.19",
    solidity: {
      compilers: [
        {
          version: '0.8.0'
        },
        {
          version: '0.8.7'
        },
        {
          version: '0.8.19'
        },
      ]
    },
    defaultNetwork: "hardhat",
    networks: {
      sepolia: {
        url: process.env.RPC_URL,
        accounts: [PRIVATE_KEY],
        chainId: 11155111,
        hardfork: "istanbul" // Add this line to mark it as a development network
      },
      localhost: {
        url: process.env.LOCAL_RPC_URL,
        chainId: 1337
      }
    },
    etherscan: {
      apiKey: process.env.VERIFICATION_API_KEY
    },
    gasReporter:{
      enabled: true,
      outputFile: "gasReport.txt",
      noColors: true,
      currency: "USD",
      coinmarketcap: process.env.COIN_MARKET_CAP_API_KEY,
      token: 'eth'
    },
    namedAccounts: {
      deployer: {
        default: 0,
        11155111: 1
      },
      user: {
        default: 1
      }
    }
  };

export default config;
