require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
const dotenv = require("dotenv");

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    solana: {
      url: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 101,
      allowUnlimitedContractSize: true,
      timeout: 60000,
      gas: "auto",
      gasMultiplier: 1.5
    },
    solanaDevnet: {
      url: process.env.SOLANA_DEVNET_URL || "https://api.devnet.solana.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 102,
      allowUnlimitedContractSize: true,
      timeout: 60000,
      gas: "auto",
      gasMultiplier: 1.5
    },
    solanaTestnet: {
      url: process.env.SOLANA_TESTNET_URL || "https://api.testnet.solana.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 103,
      allowUnlimitedContractSize: true,
      timeout: 60000,
      gas: "auto",
      gasMultiplier: 1.5
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 60000
  },
  etherscan: { 
    apiKey: {
      solana: process.env.SOLANA_EXPLORER_API_KEY,
    },
    customChains: [
      {
        network: "solana",
        chainId: 101,
        urls: {
          apiURL: "https://api.solscan.io/api",
          browserURL: "https://solscan.io",
        }
      }
    ]
  },
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  }
}; 