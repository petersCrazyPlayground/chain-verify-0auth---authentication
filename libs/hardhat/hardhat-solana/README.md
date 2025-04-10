# Hardhat Solana

This project contains Solana smart contracts developed using Hardhat.

## Project Structure
```
hardhat-solana/
├── contracts/         # Smart contract source files
├── node_modules/      # Dependencies
└── README.md          # This file
```

## Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Hardhat
- Solana CLI tools

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
SOLANA_RPC_URL=your_rpc_url
PRIVATE_KEY=your_private_key
```

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
To deploy contracts to the Solana network:
```bash
npx hardhat run scripts/deploy.js --network solana
```

## Smart Contracts
The following smart contracts are included in this project:
- [List contracts here with brief descriptions]

## Testing
Run the test suite:
```bash
npx hardhat test
```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
[Specify license here] 