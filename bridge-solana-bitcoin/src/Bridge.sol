// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SolanaBitcoinBridge is ReentrancyGuard {
    address public owner;
    mapping(bytes32 => bool) public processedTransactions;
    mapping(address => uint256) public lockedBalances;
    
    event BridgeInitiated(
        address indexed sender,
        uint256 amount,
        bytes32 indexed transactionId,
        string bitcoinAddress
    );
    
    event BridgeCompleted(
        bytes32 indexed transactionId,
        address indexed recipient,
        uint256 amount
    );

    constructor() {
        owner = msg.sender;
    }

    function initiateBridge(
        address token,
        uint256 amount,
        bytes32 transactionId,
        string memory bitcoinAddress
    ) external nonReentrant {
        require(!processedTransactions[transactionId], "Transaction already processed");
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(bitcoinAddress).length > 0, "Invalid Bitcoin address");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        lockedBalances[msg.sender] += amount;
        processedTransactions[transactionId] = true;
        
        emit BridgeInitiated(msg.sender, amount, transactionId, bitcoinAddress);
    }

    function completeBridge(
        address token,
        address recipient,
        uint256 amount,
        bytes32 transactionId
    ) external nonReentrant {
        require(msg.sender == owner, "Only owner can complete bridge");
        require(!processedTransactions[transactionId], "Transaction already processed");
        require(lockedBalances[recipient] >= amount, "Insufficient locked balance");
        
        lockedBalances[recipient] -= amount;
        IERC20(token).transfer(recipient, amount);
        processedTransactions[transactionId] = true;
        
        emit BridgeCompleted(transactionId, recipient, amount);
    }
} 