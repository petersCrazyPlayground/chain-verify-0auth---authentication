// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AvalancheEthereumBridge is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Structs
    struct TokenInfo {
        bool isSupported;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 dailyLimit;
        uint256 dailyTransferred;
        uint256 lastTransferTimestamp;
    }

    // Events
    event TokenAdded(address indexed token, uint256 minAmount, uint256 maxAmount, uint256 dailyLimit);
    event TokenRemoved(address indexed token);
    event TransferInitiated(
        address indexed token,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 nonce,
        bytes32 transferId
    );
    event TransferCompleted(bytes32 indexed transferId);
    event TransferReverted(bytes32 indexed transferId);
    event LimitsUpdated(address indexed token, uint256 minAmount, uint256 maxAmount, uint256 dailyLimit);

    // State variables
    mapping(address => TokenInfo) public supportedTokens;
    mapping(bytes32 => bool) public processedTransfers;
    mapping(address => uint256) public nonces;
    uint256 public constant MIN_VALIDATORS = 3;
    uint256 public constant VALIDATOR_THRESHOLD = 2;
    address[] public validators;
    mapping(address => bool) public isValidator;
    mapping(bytes32 => mapping(address => bool)) public validatorVotes;

    // Modifiers
    modifier onlyValidator() {
        require(isValidator[msg.sender], "Not a validator");
        _;
    }

    modifier tokenSupported(address token) {
        require(supportedTokens[token].isSupported, "Token not supported");
        _;
    }

    constructor(address[] memory initialValidators) {
        require(initialValidators.length >= MIN_VALIDATORS, "Insufficient validators");
        for (uint256 i = 0; i < initialValidators.length; i++) {
            require(initialValidators[i] != address(0), "Invalid validator address");
            validators.push(initialValidators[i]);
            isValidator[initialValidators[i]] = true;
        }
    }

    // Token Management
    function addSupportedToken(
        address token,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 dailyLimit
    ) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(minAmount <= maxAmount, "Invalid limits");
        require(dailyLimit > 0, "Invalid daily limit");

        supportedTokens[token] = TokenInfo({
            isSupported: true,
            minAmount: minAmount,
            maxAmount: maxAmount,
            dailyLimit: dailyLimit,
            dailyTransferred: 0,
            lastTransferTimestamp: block.timestamp
        });

        emit TokenAdded(token, minAmount, maxAmount, dailyLimit);
    }

    function removeSupportedToken(address token) external onlyOwner tokenSupported(token) {
        delete supportedTokens[token];
        emit TokenRemoved(token);
    }

    function updateTokenLimits(
        address token,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 dailyLimit
    ) external onlyOwner tokenSupported(token) {
        require(minAmount <= maxAmount, "Invalid limits");
        require(dailyLimit > 0, "Invalid daily limit");

        TokenInfo storage tokenInfo = supportedTokens[token];
        tokenInfo.minAmount = minAmount;
        tokenInfo.maxAmount = maxAmount;
        tokenInfo.dailyLimit = dailyLimit;

        emit LimitsUpdated(token, minAmount, maxAmount, dailyLimit);
    }

    // Bridge Operations
    function initiateTransfer(
        address token,
        address to,
        uint256 amount
    ) external nonReentrant tokenSupported(token) {
        TokenInfo storage tokenInfo = supportedTokens[token];
        
        // Reset daily transfer count if 24 hours have passed
        if (block.timestamp - tokenInfo.lastTransferTimestamp >= 1 days) {
            tokenInfo.dailyTransferred = 0;
            tokenInfo.lastTransferTimestamp = block.timestamp;
        }

        require(amount >= tokenInfo.minAmount, "Amount below minimum");
        require(amount <= tokenInfo.maxAmount, "Amount above maximum");
        require(
            tokenInfo.dailyTransferred + amount <= tokenInfo.dailyLimit,
            "Daily limit exceeded"
        );

        // Transfer tokens to bridge
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Update daily transfer count
        tokenInfo.dailyTransferred += amount;

        // Generate transfer ID
        uint256 nonce = nonces[msg.sender]++;
        bytes32 transferId = keccak256(
            abi.encodePacked(
                token,
                msg.sender,
                to,
                amount,
                nonce,
                block.chainid
            )
        );

        emit TransferInitiated(token, msg.sender, to, amount, nonce, transferId);
    }

    function completeTransfer(
        bytes32 transferId,
        address token,
        address to,
        uint256 amount
    ) external onlyValidator nonReentrant {
        require(!processedTransfers[transferId], "Transfer already processed");
        require(supportedTokens[token].isSupported, "Token not supported");

        // Record validator vote
        validatorVotes[transferId][msg.sender] = true;

        // Check if threshold is reached
        uint256 voteCount = 0;
        for (uint256 i = 0; i < validators.length; i++) {
            if (validatorVotes[transferId][validators[i]]) {
                voteCount++;
            }
        }

        if (voteCount >= VALIDATOR_THRESHOLD) {
            processedTransfers[transferId] = true;
            IERC20(token).safeTransfer(to, amount);
            emit TransferCompleted(transferId);
        }
    }

    function revertTransfer(
        bytes32 transferId,
        address token,
        address from,
        uint256 amount
    ) external onlyValidator nonReentrant {
        require(!processedTransfers[transferId], "Transfer already processed");
        require(supportedTokens[token].isSupported, "Token not supported");

        // Record validator vote
        validatorVotes[transferId][msg.sender] = true;

        // Check if threshold is reached
        uint256 voteCount = 0;
        for (uint256 i = 0; i < validators.length; i++) {
            if (validatorVotes[transferId][validators[i]]) {
                voteCount++;
            }
        }

        if (voteCount >= VALIDATOR_THRESHOLD) {
            processedTransfers[transferId] = true;
            IERC20(token).safeTransfer(from, amount);
            emit TransferReverted(transferId);
        }
    }

    // Validator Management
    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "Invalid validator address");
        require(!isValidator[validator], "Already a validator");

        validators.push(validator);
        isValidator[validator] = true;
    }

    function removeValidator(address validator) external onlyOwner {
        require(isValidator[validator], "Not a validator");
        require(validators.length > MIN_VALIDATORS, "Cannot remove validator: minimum required");

        isValidator[validator] = false;
        for (uint256 i = 0; i < validators.length; i++) {
            if (validators[i] == validator) {
                validators[i] = validators[validators.length - 1];
                validators.pop();
                break;
            }
        }
    }

    // View functions
    function getValidators() external view returns (address[] memory) {
        return validators;
    }

    function isTransferProcessed(bytes32 transferId) external view returns (bool) {
        return processedTransfers[transferId];
    }

    function getValidatorVotes(bytes32 transferId) external view returns (bool[] memory) {
        bool[] memory votes = new bool[](validators.length);
        for (uint256 i = 0; i < validators.length; i++) {
            votes[i] = validatorVotes[transferId][validators[i]];
        }
        return votes;
    }
} 