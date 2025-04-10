// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SolanaBridge is Ownable {
    using SafeERC20 for IERC20;

    struct BridgeTransaction {
        address token;
        uint256 amount;
        bytes32 destinationAddress;
        string destinationChain;
        bool completed;
        uint256 lockTime;
    }

    mapping(bytes32 => BridgeTransaction) public transactions;
    mapping(address => bool) public supportedTokens;
    mapping(string => bool) public supportedChains;
    uint256 public constant MIN_LOCK_TIME = 1 hours;
    uint256 public constant MAX_LOCK_TIME = 24 hours;

    event BridgeInitiated(
        bytes32 indexed transactionId,
        address indexed token,
        uint256 amount,
        bytes32 destinationAddress,
        string destinationChain,
        uint256 lockTime
    );
    event BridgeCompleted(bytes32 indexed transactionId);
    event BridgeExpired(bytes32 indexed transactionId);

    constructor() Ownable(msg.sender) {
        // Initialize supported chains
        supportedChains["avalanche"] = true;
        supportedChains["bitcoin"] = true;
        supportedChains["skale"] = true;
    }

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    function addSupportedChain(string memory chain) external onlyOwner {
        supportedChains[chain] = true;
    }

    function removeSupportedChain(string memory chain) external onlyOwner {
        supportedChains[chain] = false;
    }

    function initiateBridge(
        address token,
        uint256 amount,
        bytes32 destinationAddress,
        string memory destinationChain,
        uint256 lockTime
    ) external {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(supportedChains[destinationChain], "Chain not supported");
        require(lockTime >= MIN_LOCK_TIME && lockTime <= MAX_LOCK_TIME, "Invalid lock time");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        bytes32 transactionId = keccak256(
            abi.encodePacked(
                block.timestamp,
                msg.sender,
                token,
                amount,
                destinationAddress,
                destinationChain,
                lockTime
            )
        );

        transactions[transactionId] = BridgeTransaction({
            token: token,
            amount: amount,
            destinationAddress: destinationAddress,
            destinationChain: destinationChain,
            completed: false,
            lockTime: block.timestamp + lockTime
        });

        emit BridgeInitiated(
            transactionId,
            token,
            amount,
            destinationAddress,
            destinationChain,
            lockTime
        );
    }

    function completeBridge(bytes32 transactionId) external onlyOwner {
        BridgeTransaction storage transaction = transactions[transactionId];
        require(!transaction.completed, "Transaction already completed");
        require(block.timestamp <= transaction.lockTime, "Transaction expired");

        transaction.completed = true;
        emit BridgeCompleted(transactionId);
    }

    function expireBridge(bytes32 transactionId) external onlyOwner {
        BridgeTransaction storage transaction = transactions[transactionId];
        require(!transaction.completed, "Transaction already completed");
        require(block.timestamp > transaction.lockTime, "Transaction not expired");

        transaction.completed = true;
        emit BridgeExpired(transactionId);
    }

    function withdrawTokens(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
} 