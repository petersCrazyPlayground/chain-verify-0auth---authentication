# Avalanche-SKALE Bridge

This repository contains the smart contracts for the Avalanche-SKALE bridge, enabling cross-chain token transfers between Avalanche and SKALE networks.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Hardhat
- MetaMask or similar wallet
- Private key with funds on both networks

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

## Testing

Run the test suite:
```bash
npx hardhat test
```

## Deployment

### Deploy to Avalanche
```bash
npx hardhat run scripts/deploy.js --network avalanche
```

### Deploy to SKALE
```bash
npx hardhat run scripts/deploy.js --network skale
```

## Contract Verification

### Verify on Snowtrace (Avalanche)
```bash
npx hardhat verify --network avalanche <deployed_address>
```

### Verify on SKALE
```bash
npx hardhat verify --network skale <deployed_address>
```

## Security Considerations

- Always verify the contract addresses on both networks
- Ensure proper lock times are set for bridge operations
- Monitor bridge transactions for any suspicious activity
- Keep private keys secure and never commit them to the repository

## License

MIT 