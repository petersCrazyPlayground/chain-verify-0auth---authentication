# Solana-Bitcoin Bridge Contract

## Overview
This contract enables the transfer of assets between Solana and Bitcoin networks. It allows users to lock tokens on Solana and receive them on Bitcoin, with the bridge operator managing the cross-chain transfer.

## Features
- Support for multiple token types
- Secure asset locking mechanism
- Transaction tracking and verification
- Owner-only administrative functions
- Emergency withdrawal capabilities

## Prerequisites
- Node.js (v14 or later)
- Hardhat
- Solana CLI tools
- Bitcoin Core (for Bitcoin network interaction)
- Solana RPC URL
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
SOLANA_RPC_URL=your_solana_rpc_url
BITCOIN_RPC_URL=your_bitcoin_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

2. Deploy to Solana:
```bash
npm run deploy:solana
```

## Usage
### Adding Supported Tokens
```solidity
function addSupportedToken(address token) external onlyOwner
```
- Adds a new token to the supported tokens list
- Only callable by the contract owner

### Initiating a Bridge Transfer
```solidity
function initiateBridge(
    address token,
    uint256 amount,
    string memory bitcoinAddress
) external
```
- Locks tokens on Solana
- Generates a unique transaction ID
- Emits a `BridgeInitiated` event

### Completing a Bridge Transfer
```solidity
function completeBridge(bytes32 transactionId) external onlyOwner
```
- Marks a transaction as completed
- Only callable by the bridge operator
- Emits a `BridgeCompleted` event

### Emergency Withdrawal
```solidity
function withdrawTokens(address token, uint256 amount) external onlyOwner
```
- Allows the owner to withdraw tokens in case of emergency
- Only callable by the contract owner

## Security Considerations
1. The contract uses OpenZeppelin's `Ownable` for access control
2. All token transfers use `SafeERC20` for secure token handling
3. Transaction IDs are generated using multiple parameters to prevent collisions
4. The bridge operator must be a trusted entity
5. Regular security audits are recommended
6. Bitcoin address validation is implemented

## Network Configuration
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