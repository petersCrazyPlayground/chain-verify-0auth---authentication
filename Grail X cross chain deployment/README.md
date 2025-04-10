# Grail X Cross Chain Deployment

Cross-chain deployment configuration and scripts for the Grail X project.

## Project Structure
```
Grail X cross chain deployment/
├── config/            # Configuration files
├── scripts/          # Deployment scripts
├── contracts/        # Contract artifacts
└── README.md         # This file
```

## Features
- Multi-chain deployment automation
- Configuration management
- Contract verification
- Network monitoring
- Deployment tracking

## Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Hardhat
- MetaMask or similar wallet
- Private keys for target networks

## Installation
1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Install Hardhat:
```bash
npm install --save-dev hardhat
# or
yarn add --dev hardhat
```

## Configuration
1. Create a `.env` file in the root directory with the following variables:
```
# Network RPC URLs
ETHEREUM_RPC_URL=your_ethereum_rpc_url
BSC_RPC_URL=your_bsc_rpc_url
POLYGON_RPC_URL=your_polygon_rpc_url
AVALANCHE_RPC_URL=your_avalanche_rpc_url
SOLANA_RPC_URL=your_solana_rpc_url

# Private Keys
ETHEREUM_PRIVATE_KEY=your_ethereum_private_key
BSC_PRIVATE_KEY=your_bsc_private_key
POLYGON_PRIVATE_KEY=your_polygon_private_key
AVALANCHE_PRIVATE_KEY=your_avalanche_private_key
SOLANA_PRIVATE_KEY=your_solana_private_key

# API Keys
ETHERSCAN_API_KEY=your_etherscan_key
BSCSCAN_API_KEY=your_bscscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
SNOWTRACE_API_KEY=your_snowtrace_key
```

## Deployment Process
1. Prepare deployment:
```bash
npm run prepare-deployment
# or
yarn prepare-deployment
```

2. Deploy to all networks:
```bash
npm run deploy-all
# or
yarn deploy-all
```

3. Verify contracts:
```bash
npm run verify-all
# or
yarn verify-all
```

## Network Configuration
### Ethereum
- Network: Ethereum Mainnet
- Chain ID: 1
- Explorer: Etherscan

### BSC
- Network: Binance Smart Chain
- Chain ID: 56
- Explorer: BscScan

### Polygon
- Network: Polygon Mainnet
- Chain ID: 137
- Explorer: PolygonScan

### Avalanche
- Network: Avalanche C-Chain
- Chain ID: 43114
- Explorer: Snowtrace

### Solana
- Network: Solana Mainnet
- Explorer: Solana Explorer

## Deployment Verification
1. Check contract addresses:
```bash
npm run check-addresses
# or
yarn check-addresses
```

2. Verify contract code:
```bash
npm run verify-contracts
# or
yarn verify-contracts
```

## Security Considerations
- Secure private key management
- Multi-signature deployment
- Contract verification
- Network monitoring
- Emergency procedures

## Testing
Run the deployment verification:
```bash
npm run verify-deployment
# or
yarn verify-deployment
```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT 