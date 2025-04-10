// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract AvalancheBitcoinBridge is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    struct TokenInfo {
        uint256 minAmount;
        uint256 maxAmount;
        uint256 dailyLimit;
        uint256 dailyUsage;
        uint256 lastResetTime;
        bool isSupported;
    }

    struct BridgeTransaction {
        address sender;
        address token;
        uint256 amount;
        string bitcoinAddress;
        uint256 timestamp;
        uint256 nonce;
        bool completed;
    }

    mapping(address => TokenInfo) public tokenInfo;
    mapping(bytes32 => BridgeTransaction) public transactions;
    mapping(address => uint256) public nonces;

    uint256 public constant MIN_LOCK_TIME = 1 hours;
    uint256 public constant MAX_LOCK_TIME = 24 hours;
    uint256 public constant DAILY_RESET_TIME = 24 hours;

    event BridgeInitiated(
        bytes32 indexed transactionId,
        address indexed sender,
        address indexed token,
        uint256 amount,
        string bitcoinAddress,
        uint256 timestamp
    );

    event BridgeCompleted(bytes32 indexed transactionId);
    event BridgeFailed(bytes32 indexed transactionId, string reason);
    event TokenAdded(address indexed token, uint256 minAmount, uint256 maxAmount, uint256 dailyLimit);
    event TokenRemoved(address indexed token);
    event DailyLimitUpdated(address indexed token, uint256 newLimit);

    constructor() Ownable(msg.sender) {}

    modifier whenNotPaused() override {
        require(!paused(), "Bridge is paused");
        _;
    }

    function addSupportedToken(
        address token,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 dailyLimit
    ) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(minAmount <= maxAmount, "Invalid amount range");
        require(dailyLimit > 0, "Invalid daily limit");

        tokenInfo[token] = TokenInfo({
            minAmount: minAmount,
            maxAmount: maxAmount,
            dailyLimit: dailyLimit,
            dailyUsage: 0,
            lastResetTime: block.timestamp,
            isSupported: true
        });

        emit TokenAdded(token, minAmount, maxAmount, dailyLimit);
    }

    function removeSupportedToken(address token) external onlyOwner {
        require(tokenInfo[token].isSupported, "Token not supported");
        delete tokenInfo[token];
        emit TokenRemoved(token);
    }

    function updateDailyLimit(address token, uint256 newLimit) external onlyOwner {
        require(tokenInfo[token].isSupported, "Token not supported");
        require(newLimit > 0, "Invalid daily limit");
        tokenInfo[token].dailyLimit = newLimit;
        emit DailyLimitUpdated(token, newLimit);
    }

    function transferToBitcoin(
        address token,
        uint256 amount,
        string memory bitcoinAddress
    ) external nonReentrant whenNotPaused {
        require(tokenInfo[token].isSupported, "Token not supported");
        require(amount >= tokenInfo[token].minAmount, "Amount below minimum");
        require(amount <= tokenInfo[token].maxAmount, "Amount above maximum");
        require(bytes(bitcoinAddress).length > 0, "Invalid Bitcoin address");

        _resetDailyUsageIfNeeded(token);

        TokenInfo storage info = tokenInfo[token];
        require(info.dailyUsage + amount <= info.dailyLimit, "Daily limit exceeded");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        info.dailyUsage += amount;

        uint256 nonce = nonces[msg.sender]++;
        bytes32 transactionId = keccak256(
            abi.encodePacked(
                msg.sender,
                token,
                amount,
                bitcoinAddress,
                nonce,
                block.timestamp
            )
        );

        transactions[transactionId] = BridgeTransaction({
            sender: msg.sender,
            token: token,
            amount: amount,
            bitcoinAddress: bitcoinAddress,
            timestamp: block.timestamp,
            nonce: nonce,
            completed: false
        });

        emit BridgeInitiated(
            transactionId,
            msg.sender,
            token,
            amount,
            bitcoinAddress,
            block.timestamp
        );
    }

    function completeBridge(bytes32 transactionId) external onlyOwner {
        BridgeTransaction storage transaction = transactions[transactionId];
        require(transaction.sender != address(0), "Transaction not found");
        require(!transaction.completed, "Transaction already completed");
        require(
            block.timestamp >= transaction.timestamp + MIN_LOCK_TIME,
            "Lock time not elapsed"
        );
        require(
            block.timestamp <= transaction.timestamp + MAX_LOCK_TIME,
            "Lock time expired"
        );

        transaction.completed = true;
        emit BridgeCompleted(transactionId);
    }

    function failBridge(bytes32 transactionId, string calldata reason) external onlyOwner {
        BridgeTransaction storage transaction = transactions[transactionId];
        require(transaction.sender != address(0), "Transaction not found");
        require(!transaction.completed, "Transaction already completed");

        IERC20(transaction.token).safeTransfer(transaction.sender, transaction.amount);
        transaction.completed = true;

        emit BridgeFailed(transactionId, reason);
    }

    function emergencyWithdraw(address token) external onlyOwner {
        require(tokenInfo[token].isSupported, "Token not supported");
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransfer(owner(), balance);
    }

    function _resetDailyUsageIfNeeded(address token) private {
        TokenInfo storage info = tokenInfo[token];
        if (block.timestamp >= info.lastResetTime + DAILY_RESET_TIME) {
            info.dailyUsage = 0;
            info.lastResetTime = block.timestamp;
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
} 