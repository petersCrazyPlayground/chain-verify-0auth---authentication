# Multi-Chain Wallet Contract

## Overview
The Multi-Chain Wallet contract provides a unified interface for managing assets across Avalanche, Solana, and Bitcoin networks. It allows users to deposit and withdraw tokens from different chains while maintaining separate balances for each chain.

## Features
- Multi-chain asset management
- Chain-specific balance tracking
- Support for multiple ERC20 tokens
- Bridge contract integration
- Owner-only administrative functions
- Emergency withdrawal capabilities

## Prerequisites
- Node.js (v14 or later)
- Hardhat
- Avalanche C-Chain RPC URL
- Solana RPC URL
- Bitcoin Core (for Bitcoin network interaction)
- Bitcoin RPC URL

## Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file based on `.env.example`
4. Compile the contracts:
```bash
npm run compile
```

## Deployment
1. Set up your environment variables in `.env`:
```bash
AVALANCHE_RPC_URL=your_avalanche_rpc_url
SOLANA_RPC_URL=your_solana_rpc_url
BITCOIN_RPC_URL=your_bitcoin_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

2. Deploy to Avalanche:
```bash
npm run deploy:avalanche
```

## Usage
### Adding Supported Tokens
```solidity
function addSupportedToken(address token) external onlyOwner
```
- Adds a new ERC20 token to the supported tokens list
- Only callable by the contract owner

### Setting Bridge Contracts
```solidity
function setBridgeContract(Chain chain, address bridge) external onlyOwner
```
- Sets the bridge contract address for a specific chain
- Only callable by the contract owner

### Depositing Tokens
```solidity
function deposit(
    address token,
    uint256 amount,
    Chain chain
) external
```
- Deposits tokens into the wallet for a specific chain
- Requires token approval
- Updates the chain-specific balance
- Emits a `Deposit` event

### Withdrawing Tokens
```solidity
function withdraw(
    address token,
    uint256 amount,
    Chain chain
) external onlyOwner
```
- Withdraws tokens from the wallet for a specific chain
- Only callable by the contract owner
- Updates the chain-specific balance
- Emits a `Withdraw` event

### Checking Balances
```solidity
function getBalance(
    address token,
    Chain chain
) external view returns (uint256)
```
- Returns the balance of a token for a specific chain
- View function with no state changes

## Security Considerations
1. The contract uses OpenZeppelin's `Ownable` for access control
2. All token transfers use `SafeERC20` for secure token handling
3. Chain-specific balances are tracked separately
4. The bridge operator must be a trusted entity
5. Regular security audits are recommended
6. Bridge contract addresses must be carefully verified

## Network Configuration
### Avalanche
- Network: Avalanche C-Chain
- Chain ID: 43114 (Mainnet) / 43113 (Testnet)
- RPC URL: https://api.avax.network/ext/bc/C/rpc

### Solana
- Network: Solana Mainnet / Testnet
- RPC URL: https://api.mainnet-beta.solana.com

### Bitcoin
- Network: Bitcoin Mainnet / Testnet
- RPC URL: Custom Bitcoin Core RPC endpoint
- Required Bitcoin Core configuration:
  ```conf
  server=1
  rpcuser=your_username
  rpcpassword=your_password
  rpcallowip=127.0.0.1
  ```

## Testing
Run the test suite:
```bash
npm test
```

## License
MIT License 