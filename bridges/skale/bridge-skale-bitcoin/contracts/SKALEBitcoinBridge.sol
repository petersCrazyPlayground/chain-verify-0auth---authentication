// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SKALEBitcoinBridge is Ownable {
    using SafeERC20 for IERC20;

    struct BridgeTransaction {
        address token;
        uint256 amount;
        string bitcoinAddress;
        bool completed;
        uint256 lockTime;
    }

    mapping(bytes32 => BridgeTransaction) public transactions;
    mapping(address => bool) public supportedTokens;
    mapping(bytes32 => bool) public transactionIds;

    uint256 public constant MIN_LOCK_TIME = 1 hours;
    uint256 public constant MAX_LOCK_TIME = 7 days;

    event BridgeInitiated(
        bytes32 indexed transactionId,
        address indexed token,
        uint256 amount,
        string bitcoinAddress,
        uint256 lockTime
    );
    event BridgeCompleted(bytes32 indexed transactionId);
    event BridgeExpired(bytes32 indexed transactionId);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);

    constructor() Ownable(msg.sender) {}

    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(!supportedTokens[token], "Token already supported");
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    function removeSupportedToken(address token) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    function initiateBridge(
        address token,
        uint256 amount,
        string memory bitcoinAddress,
        uint256 lockTime
    ) external {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(bitcoinAddress).length > 0, "Invalid Bitcoin address");
        require(lockTime >= MIN_LOCK_TIME && lockTime <= MAX_LOCK_TIME, "Invalid lock time");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        bytes32 transactionId = keccak256(
            abi.encodePacked(
                token,
                amount,
                bitcoinAddress,
                block.timestamp
            )
        );

        require(!transactionIds[transactionId], "Transaction already exists");

        transactions[transactionId] = BridgeTransaction({
            token: token,
            amount: amount,
            bitcoinAddress: bitcoinAddress,
            completed: false,
            lockTime: block.timestamp + lockTime
        });

        transactionIds[transactionId] = true;

        emit BridgeInitiated(transactionId, token, amount, bitcoinAddress, lockTime);
    }

    function completeBridge(bytes32 transactionId) external onlyOwner {
        BridgeTransaction storage transaction = transactions[transactionId];
        require(transaction.amount > 0, "Transaction does not exist");
        require(!transaction.completed, "Transaction already completed");
        require(block.timestamp < transaction.lockTime, "Transaction expired");

        transaction.completed = true;
        emit BridgeCompleted(transactionId);
    }

    function expireBridge(bytes32 transactionId) external {
        BridgeTransaction storage transaction = transactions[transactionId];
        require(transaction.amount > 0, "Transaction does not exist");
        require(!transaction.completed, "Transaction already completed");
        require(block.timestamp >= transaction.lockTime, "Lock time not expired");

        transaction.completed = true;
        emit BridgeExpired(transactionId);
    }

    function withdraw(bytes32 transactionId) external {
        BridgeTransaction storage transaction = transactions[transactionId];
        require(transaction.amount > 0, "Transaction does not exist");
        require(transaction.completed, "Transaction not completed");
        require(block.timestamp >= transaction.lockTime, "Lock time not expired");

        IERC20(transaction.token).safeTransfer(msg.sender, transaction.amount);
    }
} 