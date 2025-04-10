# Multi-Chain Wallet API Reference

## Overview
This document provides detailed API documentation for the Multi-Chain Wallet smart contract system.

## Core Interfaces

### IMultiChainWallet
```solidity
interface IMultiChainWallet {
    // Wallet Management
    function initialize() external;
    function isInitialized() external view returns (bool);
    function getOwner() external view returns (address);
    
    // Asset Management
    function addAsset(string memory symbol, address tokenAddress) external;
    function removeAsset(string memory symbol) external;
    function getAsset(string memory symbol) external view returns (address);
    function getSupportedAssets() external view returns (string[] memory);
    
    // Balance Management
    function getBalance(string memory symbol) external view returns (uint256);
    function getBalances() external view returns (string[] memory, uint256[] memory);
    
    // Transaction Management
    function transfer(string memory symbol, address to, uint256 amount) external;
    function approve(string memory symbol, address spender, uint256 amount) external;
    function transferFrom(string memory symbol, address from, address to, uint256 amount) external;
    
    // Cross-Chain Operations
    function bridgeTransfer(string memory symbol, uint256 amount, string memory targetChain) external;
    function receiveBridgedTokens(string memory symbol, uint256 amount, string memory sourceChain) external;
    
    // Security Features
    function setupMultiSig(uint256 required, address[] memory signers) external;
    function addSigner(address signer) external;
    function removeSigner(address signer) external;
    function scheduleTransfer(string memory symbol, address to, uint256 amount, uint256 delay) external;
    function cancelScheduledTransfer(bytes32 transferId) external;
    
    // Emergency Functions
    function pause() external;
    function unpause() external;
    function emergencyWithdraw(string memory symbol) external;
}
```

### IAssetRegistry
```solidity
interface IAssetRegistry {
    // Asset Registration
    function registerAsset(string memory symbol, address tokenAddress) external;
    function unregisterAsset(string memory symbol) external;
    function isAssetRegistered(string memory symbol) external view returns (bool);
    
    // Asset Information
    function getAssetAddress(string memory symbol) external view returns (address);
    function getAssetSymbol(address tokenAddress) external view returns (string memory);
    function getAssetDecimals(string memory symbol) external view returns (uint8);
    
    // Asset Validation
    function validateAsset(string memory symbol) external view returns (bool);
    function getAssetType(string memory symbol) external view returns (AssetType);
}
```

### ISecurityManager
```solidity
interface ISecurityManager {
    // Access Control
    function hasRole(bytes32 role, address account) external view returns (bool);
    function grantRole(bytes32 role, address account) external;
    function revokeRole(bytes32 role, address account) external;
    
    // Multi-Signature
    function isMultiSigEnabled() external view returns (bool);
    function getRequiredSignatures() external view returns (uint256);
    function getSigners() external view returns (address[] memory);
    
    // Transaction Security
    function validateTransaction(address from, address to, uint256 amount) external view returns (bool);
    function checkRateLimit(address account) external view returns (bool);
    
    // Emergency Controls
    function isPaused() external view returns (bool);
    function canEmergencyWithdraw(address account) external view returns (bool);
}
```

## Data Structures

### AssetInfo
```solidity
struct AssetInfo {
    address tokenAddress;
    string symbol;
    uint8 decimals;
    AssetType assetType;
    bool isActive;
    uint256 lastUpdate;
}
```

### ScheduledTransfer
```solidity
struct ScheduledTransfer {
    string symbol;
    address from;
    address to;
    uint256 amount;
    uint256 scheduledTime;
    bool executed;
    bool cancelled;
}
```

### BridgeTransfer
```solidity
struct BridgeTransfer {
    string symbol;
    uint256 amount;
    string sourceChain;
    string targetChain;
    address sender;
    address recipient;
    uint256 timestamp;
    TransferStatus status;
}
```

## Enums

### AssetType
```solidity
enum AssetType {
    NATIVE,
    ERC20,
    ERC721,
    ERC1155,
    BRIDGED
}
```

### TransferStatus
```solidity
enum TransferStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED,
    CANCELLED
}
```

## Events

### Wallet Events
```solidity
event WalletInitialized(address indexed owner);
event AssetAdded(string indexed symbol, address indexed tokenAddress);
event AssetRemoved(string indexed symbol);
event TransferExecuted(string indexed symbol, address indexed from, address indexed to, uint256 amount);
event BridgeTransferInitiated(string indexed symbol, string indexed sourceChain, string indexed targetChain, uint256 amount);
event BridgeTransferCompleted(string indexed symbol, string indexed sourceChain, string indexed targetChain, uint256 amount);
```

### Security Events
```solidity
event MultiSigSetup(uint256 required, address[] signers);
event SignerAdded(address indexed signer);
event SignerRemoved(address indexed signer);
event TransferScheduled(bytes32 indexed transferId, string indexed symbol, address indexed to, uint256 amount, uint256 scheduledTime);
event TransferCancelled(bytes32 indexed transferId);
event EmergencyPause();
event EmergencyUnpause();
```

## Error Messages

### Common Errors
```solidity
error WalletNotInitialized();
error AssetAlreadyRegistered(string symbol);
error AssetNotRegistered(string symbol);
error InsufficientBalance(string symbol, uint256 available, uint256 required);
error TransferFailed(string symbol, address from, address to, uint256 amount);
error InvalidSigner(address signer);
error InsufficientSignatures(uint256 required, uint256 provided);
error TransferNotScheduled(bytes32 transferId);
error TransferAlreadyExecuted(bytes32 transferId);
error TransferCancelled(bytes32 transferId);
error EmergencyPaused();
```

## Usage Examples

### Initializing Wallet
```solidity
// Deploy and initialize wallet
const wallet = await MultiChainWallet.deploy();
await wallet.initialize();

// Check initialization status
const isInitialized = await wallet.isInitialized();
console.log("Wallet initialized:", isInitialized);
```

### Managing Assets
```solidity
// Add new asset
await wallet.addAsset("ETH", "0x...");

// Get asset information
const assetAddress = await wallet.getAsset("ETH");
console.log("ETH token address:", assetAddress);

// Get all supported assets
const [symbols, balances] = await wallet.getBalances();
console.log("Supported assets:", symbols);
```

### Cross-Chain Transfers
```solidity
// Bridge transfer to another chain
await wallet.bridgeTransfer("ETH", "1000000000000000000", "avalanche");

// Receive bridged tokens
await wallet.receiveBridgedTokens("ETH", "1000000000000000000", "ethereum");
```

### Security Features
```solidity
// Setup multi-signature
const signers = ["0x...", "0x...", "0x..."];
await wallet.setupMultiSig(2, signers);

// Schedule transfer
await wallet.scheduleTransfer("ETH", "0x...", "1000000000000000000", 7 days);

// Cancel scheduled transfer
await wallet.cancelScheduledTransfer(transferId);
```

## Version Information
- Current Version: 1.0.0
- Solidity Version: ^0.8.0
- Last Updated: April 10, 2024 