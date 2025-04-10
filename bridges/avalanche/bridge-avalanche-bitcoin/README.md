# Avalanche-Bitcoin Bridge

A bridge contract for transferring assets between Avalanche and Bitcoin networks. This implementation allows for secure and efficient cross-chain transfers of assets between the two networks.

## Features

- Secure cross-chain asset transfers
- Support for multiple tokens
- Configurable transfer limits
- Emergency pause functionality
- Comprehensive event logging
- Gas optimization

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Hardhat
- MetaMask or other Web3 wallet
- Access to Avalanche and Bitcoin networks

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bridge-avalanche-bitcoin
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
- `AVALANCHE_RPC_URL`: Your Avalanche network RPC URL
- `BITCOIN_RPC_URL`: Your Bitcoin network RPC URL
- `SNOWTRACE_API_KEY`: Your Snowtrace API key for contract verification
- `BITCOIN_API_KEY`: Your Bitcoin API key for contract verification
- `PRIVATE_KEY`: Your wallet's private key for deployment

## Configuration

The bridge supports the following configuration options:

### Network Configuration
- Avalanche Mainnet (Chain ID: 43114)
- Bitcoin Mainnet (Chain ID: 1)

### Token Configuration
Default supported tokens:
- USDC (Avalanche: 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E)
- USDT (Avalanche: 0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7)

## Usage

### Compile Contracts
```bash
npm run compile
```

### Deploy Bridge
```bash
npm run deploy
```

### Add Supported Token
```typescript
await bridge.addSupportedToken(
  tokenAddress,
  minAmount,
  maxAmount,
  dailyLimit
);
```

### Transfer Assets
```typescript
await bridge.transferToBitcoin(
  tokenAddress,
  amount,
  recipientAddress
);
```

### Emergency Functions
```typescript
// Pause bridge
await bridge.pause();

// Unpause bridge
await bridge.unpause();

// Emergency withdrawal
await bridge.emergencyWithdraw(tokenAddress);
```

## Security Considerations

1. Always verify the contract after deployment
2. Use secure private key management
3. Monitor bridge activity regularly
4. Keep emergency functions accessible
5. Implement proper access control

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team.

## Acknowledgments

- OpenZeppelin for the secure contract templates
- Hardhat for the development environment
- Avalanche and Bitcoin communities for their support 