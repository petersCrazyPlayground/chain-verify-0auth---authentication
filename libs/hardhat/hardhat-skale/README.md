# Hardhat SKALE

This project contains SKALE smart contracts developed using Hardhat.

## Project Structure
```
hardhat-skale/
├── contracts/         # Smart contract source files
├── node_modules/      # Dependencies
└── README.md          # This file
```

## Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Hardhat
- SKALE CLI tools
- MetaMask or similar wallet with SKALE network configured

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
SKALE_RPC_URL=your_skale_rpc_url
PRIVATE_KEY=your_private_key
SKALE_CHAIN_ID=your_chain_id
```

2. Configure SKALE network in your wallet:
- Network Name: SKALE
- RPC URL: [Your SKALE RPC URL]
- Chain ID: [Your SKALE Chain ID]
- Currency Symbol: SKALE
- Block Explorer URL: [Your SKALE Explorer URL]

## Development
1. Start the local development network:
```bash
npx hardhat node
```

2. Compile contracts:
```bash
npx hardhat compile
```

3. Run tests:
```bash
npx hardhat test
```

## Deployment
To deploy contracts to the SKALE network:
```bash
npx hardhat run scripts/deploy.js --network skale
```

## Smart Contracts
The following smart contracts are included in this project:
- [List contracts here with brief descriptions]

## Testing
Run the test suite:
```bash
npx hardhat test
```

## Security Considerations
- Always verify contract addresses on SKALE Explorer
- Keep private keys secure
- Use proper access control in smart contracts
- Implement proper error handling
- Follow SKALE best practices for gas optimization

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT 