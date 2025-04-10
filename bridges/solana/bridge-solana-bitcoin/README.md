# Solana-Bitcoin Bridge

This repository contains the smart contracts for the Solana-Bitcoin bridge, enabling cross-chain token transfers between Solana and Bitcoin networks.

## Project Structure
```
bridge-solana-bitcoin/
├── contracts/         # Smart contract source files
├── scripts/          # Deployment and utility scripts
├── tests/            # Test files
└── README.md         # This file
```

## Features
- Cross-chain token transfers
- Multi-signature verification
- Transaction tracking
- Fee management
- Emergency controls

## Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Hardhat
- Solana CLI tools
- Bitcoin Core
- Private key with funds on both networks

## Installation
1. Install dependencies:
```bash
npm install
```

2. Install Solana CLI tools:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
```

3. Install Bitcoin Core:
```bash
# For macOS
brew install bitcoin

# For Ubuntu/Debian
sudo apt-get install bitcoin
```

## Configuration
1. Create a `.env` file in the root directory with the following variables:
```
SOLANA_RPC_URL=your_solana_rpc_url
BITCOIN_RPC_URL=your_bitcoin_rpc_url
SOLANA_PRIVATE_KEY=your_solana_private_key
BITCOIN_RPC_USER=your_bitcoin_rpc_user
BITCOIN_RPC_PASSWORD=your_bitcoin_rpc_password
```

2. Configure Solana CLI:
```bash
solana config set --url devnet
solana-keygen new --outfile wallet.json
```

3. Configure Bitcoin Core:
```conf
# bitcoin.conf
server=1
rpcuser=your_rpc_user
rpcpassword=your_rpc_password
rpcallowip=127.0.0.1
```

## Testing
Run the test suite:
```bash
npx hardhat test
```

## Deployment

### Deploy to Solana
```bash
npx hardhat run scripts/deploy.js --network solana
```

### Configure Bitcoin Bridge
```bash
npx hardhat run scripts/configure-bitcoin.js
```

## Contract Verification

### Verify on Solana Explorer
```bash
solana program deploy --program-id <deployed_address>
```

## Security Considerations
- Always verify the contract addresses on both networks
- Ensure proper lock times are set for bridge operations
- Monitor bridge transactions for any suspicious activity
- Keep private keys secure and never commit them to the repository
- Implement proper access control for bridge operators
- Use multi-signature wallets for Bitcoin

## Network Configuration
### Solana
- Network: Solana Mainnet / Testnet
- RPC URL: https://api.mainnet-beta.solana.com
- Program ID: [Your Program ID]

### Bitcoin
- Network: Bitcoin Mainnet / Testnet
- RPC URL: http://localhost:8332 (Mainnet) / http://localhost:18332 (Testnet)
- Required Bitcoin Core configuration:
  ```conf
  server=1
  rpcuser=your_username
  rpcpassword=your_password
  rpcallowip=127.0.0.1
  ```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT 