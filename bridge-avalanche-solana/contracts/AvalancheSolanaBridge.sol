// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AvalancheSolanaBridge is Ownable {
    using SafeERC20 for IERC20;

    struct BridgeTransaction {
        address token;
        uint256 amount;
        bytes32 solanaAddress;
        bool completed;
    }

    mapping(bytes32 => BridgeTransaction) public transactions;
    mapping(address => bool) public supportedTokens;

    event BridgeInitiated(
        bytes32 indexed transactionId,
        address indexed token,
        uint256 amount,
        bytes32 solanaAddress
    );
    event BridgeCompleted(bytes32 indexed transactionId);

    constructor() Ownable(msg.sender) {}

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    function initiateBridge(
        address token,
        uint256 amount,
        bytes32 solanaAddress
    ) external {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        bytes32 transactionId = keccak256(
            abi.encodePacked(
                block.timestamp,
                msg.sender,
                token,
                amount,
                solanaAddress
            )
        );

        transactions[transactionId] = BridgeTransaction({
            token: token,
            amount: amount,
            solanaAddress: solanaAddress,
            completed: false
        });

        emit BridgeInitiated(transactionId, token, amount, solanaAddress);
    }

    function completeBridge(bytes32 transactionId) external onlyOwner {
        BridgeTransaction storage transaction = transactions[transactionId];
        require(!transaction.completed, "Transaction already completed");

        transaction.completed = true;
        emit BridgeCompleted(transactionId);
    }

    function withdrawTokens(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
} 