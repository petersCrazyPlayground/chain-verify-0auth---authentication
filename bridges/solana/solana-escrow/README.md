# Solana Escrow

A secure escrow smart contract implementation on the Solana blockchain.

## Project Structure
```
solana-escrow/
├── src/               # Source code
├── tests/            # Test files
├── scripts/          # Deployment and utility scripts
└── README.md         # This file
```

## Features
- Secure token escrow
- Multi-party agreement
- Time-locked releases
- Dispute resolution mechanism
- Automatic release conditions

## Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Solana CLI tools
- Anchor framework
- Rust (for contract development)

## Installation
1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Install Anchor:
```bash
cargo install --git https://github.com/project-serum/anchor avm --locked --force
avm install latest
avm use latest
```

## Configuration
1. Create a `.env` file in the root directory with the following variables:
```
SOLANA_RPC_URL=your_rpc_url
WALLET_PATH=path_to_your_wallet.json
```

2. Configure Solana CLI:
```bash
solana config set --url localhost
solana-keygen new --outfile wallet.json
```

## Development
1. Start local validator:
```bash
solana-test-validator
```

2. Build the program:
```bash
anchor build
```

3. Run tests:
```bash
anchor test
```

## Deployment
1. Deploy to local network:
```bash
anchor deploy
```

2. Deploy to devnet:
```bash
solana config set --url devnet
anchor deploy
```

3. Deploy to mainnet:
```bash
solana config set --url mainnet-beta
anchor deploy
```

## Smart Contract Architecture
The escrow contract implements the following features:
- Token deposit and withdrawal
- Multi-signature verification
- Time-based release conditions
- Dispute resolution
- Fee management

## Security Considerations
- All deposits are held in program-derived accounts
- Multi-signature requirements for critical operations
- Time-locked releases to prevent immediate withdrawals
- Dispute resolution mechanism for contested releases
- Regular security audits recommended

## Testing
Run the test suite:
```bash
anchor test
```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT 