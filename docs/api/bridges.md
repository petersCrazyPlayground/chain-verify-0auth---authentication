# Bridge System API Reference

## Overview
This document provides detailed API documentation for the Cross-Chain Bridge system.

## Core Interfaces

### IBridge
```solidity
interface IBridge {
    // Bridge Management
    function initialize() external;
    function isInitialized() external view returns (bool);
    function getBridgeId() external view returns (string memory);
    
    // Asset Management
    function registerAsset(string memory symbol, address tokenAddress) external;
    function unregisterAsset(string memory symbol) external;
    function isAssetSupported(string memory symbol) external view returns (bool);
    
    // Cross-Chain Operations
    function lockTokens(string memory symbol, uint256 amount) external;
    function unlockTokens(string memory symbol, uint256 amount) external;
    function mintTokens(string memory symbol, uint256 amount) external;
    function burnTokens(string memory symbol, uint256 amount) external;
    
    // Transaction Management
    function getTransactionStatus(bytes32 txHash) external view returns (TransactionStatus);
    function getPendingTransactions() external view returns (bytes32[] memory);
    function processTransaction(bytes32 txHash) external;
    
    // Security Features
    function addValidator(address validator) external;
    function removeValidator(address validator) external;
    function isValidator(address account) external view returns (bool);
    function getValidators() external view returns (address[] memory);
    
    // Emergency Functions
    function pause() external;
    function unpause() external;
    function emergencyWithdraw(string memory symbol) external;
}
```

### IValidator
```solidity
interface IValidator {
    // Validation Management
    function validateTransaction(bytes32 txHash) external view returns (bool);
    function signTransaction(bytes32 txHash) external;
    function getSignature(bytes32 txHash) external view returns (bytes memory);
    
    // Validator Information
    function getValidatorAddress() external view returns (address);
    function getStakeAmount() external view returns (uint256);
    function isActive() external view returns (bool);
    
    // Slashing
    function slash(address validator) external;
    function getSlashedAmount() external view returns (uint256);
}
```

### IAssetManager
```solidity
interface IAssetManager {
    // Asset Registration
    function registerAsset(string memory symbol, address tokenAddress) external;
    function unregisterAsset(string memory symbol) external;
    function isAssetRegistered(string memory symbol) external view returns (bool);
    
    // Asset Information
    function getAssetAddress(string memory symbol) external view returns (address);
    function getAssetSymbol(address tokenAddress) external view returns (string memory);
    function getAssetDecimals(string memory symbol) external view returns (uint8);
    
    // Balance Management
    function getLockedBalance(string memory symbol) external view returns (uint256);
    function getMintedBalance(string memory symbol) external view returns (uint256);
    function getTotalSupply(string memory symbol) external view returns (uint256);
}
```

## Data Structures

### Transaction
```solidity
struct Transaction {
    string symbol;
    uint256 amount;
    address sender;
    address recipient;
    string sourceChain;
    string targetChain;
    uint256 timestamp;
    TransactionStatus status;
    bytes32[] validatorSignatures;
}
```

### ValidatorInfo
```solidity
struct ValidatorInfo {
    address validatorAddress;
    uint256 stakeAmount;
    bool isActive;
    uint256 lastValidation;
    uint256 slashedAmount;
}
```

### AssetInfo
```solidity
struct AssetInfo {
    address tokenAddress;
    string symbol;
    uint8 decimals;
    uint256 lockedAmount;
    uint256 mintedAmount;
    bool isActive;
    uint256 lastUpdate;
}
```

## Enums

### TransactionStatus
```solidity
enum TransactionStatus {
    PENDING,
    LOCKED,
    MINTED,
    BURNED,
    UNLOCKED,
    FAILED,
    CANCELLED
}
```

### ValidationStatus
```solidity
enum ValidationStatus {
    PENDING,
    APPROVED,
    REJECTED,
    TIMEOUT
}
```

## Events

### Bridge Events
```solidity
event BridgeInitialized(string indexed bridgeId);
event AssetRegistered(string indexed symbol, address indexed tokenAddress);
event AssetUnregistered(string indexed symbol);
event TokensLocked(string indexed symbol, address indexed sender, uint256 amount);
event TokensUnlocked(string indexed symbol, address indexed recipient, uint256 amount);
event TokensMinted(string indexed symbol, address indexed recipient, uint256 amount);
event TokensBurned(string indexed symbol, address indexed sender, uint256 amount);
```

### Validator Events
```solidity
event ValidatorAdded(address indexed validator);
event ValidatorRemoved(address indexed validator);
event TransactionValidated(bytes32 indexed txHash, address indexed validator, bool approved);
event ValidatorSlashed(address indexed validator, uint256 amount);
```

### Security Events
```solidity
event BridgePaused();
event BridgeUnpaused();
event EmergencyWithdraw(string indexed symbol, address indexed recipient, uint256 amount);
```

## Error Messages

### Common Errors
```solidity
error BridgeNotInitialized();
error AssetAlreadyRegistered(string symbol);
error AssetNotRegistered(string symbol);
error InsufficientBalance(string symbol, uint256 available, uint256 required);
error TransactionFailed(bytes32 txHash);
error InvalidValidator(address validator);
error InsufficientValidations(bytes32 txHash, uint256 required, uint256 provided);
error TransactionNotPending(bytes32 txHash);
error TransactionAlreadyProcessed(bytes32 txHash);
error BridgePaused();
```

## Usage Examples

### Initializing Bridge
```solidity
// Deploy and initialize bridge
const bridge = await Bridge.deploy();
await bridge.initialize();

// Check initialization status
const isInitialized = await bridge.isInitialized();
console.log("Bridge initialized:", isInitialized);
```

### Managing Assets
```solidity
// Register new asset
await bridge.registerAsset("ETH", "0x...");

// Check asset support
const isSupported = await bridge.isAssetSupported("ETH");
console.log("ETH supported:", isSupported);

// Get asset information
const assetAddress = await bridge.getAssetAddress("ETH");
console.log("ETH token address:", assetAddress);
```

### Cross-Chain Transfers
```solidity
// Lock tokens for transfer
await bridge.lockTokens("ETH", "1000000000000000000");

// Mint tokens on destination chain
await bridge.mintTokens("ETH", "1000000000000000000");

// Burn tokens for return transfer
await bridge.burnTokens("ETH", "1000000000000000000");

// Unlock original tokens
await bridge.unlockTokens("ETH", "1000000000000000000");
```

### Validator Management
```solidity
// Add new validator
await bridge.addValidator("0x...");

// Check validator status
const isValidator = await bridge.isValidator("0x...");
console.log("Is validator:", isValidator);

// Get all validators
const validators = await bridge.getValidators();
console.log("Validators:", validators);
```

## Version Information
- Current Version: 1.0.0
- Solidity Version: ^0.8.0
- Last Updated: April 10, 2024 