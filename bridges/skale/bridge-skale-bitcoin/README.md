# SKALE-Bitcoin Bridge

This repository contains the smart contracts for the SKALE-Bitcoin bridge, enabling cross-chain token transfers between SKALE and Bitcoin networks.

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

### Deploy to SKALE
```bash
npx hardhat run scripts/deploy.js --network skale
```

### Deploy to Bitcoin
```bash
npx hardhat run scripts/deploy.js --network bitcoin
```

## Contract Verification

### Verify on SKALE
```bash
npx hardhat verify --network skale <deployed_address>
```

### Verify on Bitcoin
```bash
npx hardhat verify --network bitcoin <deployed_address>
```

## Security Considerations

- Always verify the contract addresses on both networks
- Ensure proper lock times are set for bridge operations
- Monitor bridge transactions for any suspicious activity
- Keep private keys secure and never commit them to the repository

## License

MIT 