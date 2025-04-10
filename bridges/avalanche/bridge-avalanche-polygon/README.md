# Avalanche-Polygon Bridge

A secure and efficient bridge implementation for cross-chain transfers between Avalanche and Polygon networks. This bridge supports token transfers with validator-based consensus and includes comprehensive security features.

## Features

- **Cross-Chain Token Transfers**: Seamless transfer of tokens between Avalanche and Polygon networks
- **Validator-Based Consensus**: Secure transaction validation through a network of validators
- **Token Management**: Support for multiple tokens with configurable limits
- **Security Features**:
  - Minimum validator requirements
  - Transaction nonce tracking
  - Daily transfer limits
  - Emergency pause functionality
- **Gas Optimization**: Efficient contract design with optimized gas usage
- **Comprehensive Testing**: Extensive test coverage for all bridge operations

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Hardhat
- Access to Avalanche and Polygon networks (mainnet or testnet)
- API keys for Snowtrace and Polygonscan

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bridge-avalanche-polygon
```

2. Install dependencies:
```bash
npm install
```

3. Create and configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration values.

## Configuration

### Environment Variables

- `AVALANCHE_RPC_URL`: Avalanche mainnet RPC endpoint
- `AVALANCHE_TESTNET_RPC_URL`: Avalanche testnet RPC endpoint
- `POLYGON_RPC_URL`: Polygon mainnet RPC endpoint
- `MUMBAI_RPC_URL`: Polygon testnet RPC endpoint
- `PRIVATE_KEY`: Your wallet's private key for deployment
- `SNOWTRACE_API_KEY`: API key for Avalanche contract verification
- `POLYGONSCAN_API_KEY`: API key for Polygon contract verification
- `MIN_VALIDATORS`: Minimum number of validators required
- `VALIDATOR_THRESHOLD`: Number of validator votes needed for consensus

### Token Configuration

The bridge supports multiple tokens with configurable parameters:
- Minimum transfer amount
- Maximum transfer amount
- Daily transfer limit
- Token mapping between networks

## Usage

### Deployment

1. Deploy to Avalanche mainnet:
```bash
npx hardhat run scripts/deploy.ts --network avalanche
```

2. Deploy to Polygon mainnet:
```bash
npx hardhat run scripts/deploy.ts --network polygon
```

### Managing Tokens

Use the token management script to add, remove, or update supported tokens:
```bash
npx hardhat run scripts/manage-tokens.ts --network <network> --action <action> --token <token-address>
```

### Testing

Run the test suite:
```bash
npx hardhat test
```

## Smart Contract Architecture

### Core Components

1. **AvalanchePolygonBridge.sol**
   - Main bridge contract
   - Handles cross-chain transfers
   - Manages validators and consensus
   - Implements security features

2. **ERC20Mock.sol**
   - Mock ERC20 token for testing
   - Implements standard ERC20 interface

### Key Functions

- `initiateTransfer`: Start a cross-chain transfer
- `completeTransfer`: Finalize a transfer with validator consensus
- `revertTransfer`: Cancel a pending transfer
- `addValidator`: Add a new validator
- `removeValidator`: Remove an existing validator
- `addSupportedToken`: Add a new supported token
- `removeSupportedToken`: Remove a supported token
- `updateTokenLimits`: Update token transfer limits

## Security Considerations

1. **Validator Management**
   - Minimum validator requirement
   - Validator threshold for consensus
   - Validator addition/removal restrictions

2. **Transfer Security**
   - Nonce tracking to prevent replay attacks
   - Daily limits to prevent large-scale attacks
   - Emergency pause functionality

3. **Token Management**
   - Token mapping verification
   - Transfer amount validation
   - Daily limit enforcement

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team.

## Version History

- 1.0.0 (2024-04-10)
  - Initial release
  - Core bridge functionality
  - Token management
  - Validator consensus
  - Security features 