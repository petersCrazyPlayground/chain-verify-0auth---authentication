// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MultiChainWallet is Ownable {
    using SafeERC20 for IERC20;

    enum Chain {
        Avalanche,
        Solana,
        Bitcoin
    }

    struct WalletBalance {
        uint256 avalanche;
        uint256 solana;
        uint256 bitcoin;
    }

    mapping(address => WalletBalance) public balances;
    mapping(address => bool) public supportedTokens;
    mapping(Chain => address) public bridgeContracts;

    event Deposit(
        address indexed token,
        uint256 amount,
        Chain chain
    );
    event Withdraw(
        address indexed token,
        uint256 amount,
        Chain chain
    );

    constructor() Ownable(msg.sender) {}

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    function setBridgeContract(Chain chain, address bridge) external onlyOwner {
        bridgeContracts[chain] = bridge;
    }

    function deposit(
        address token,
        uint256 amount,
        Chain chain
    ) external {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(bridgeContracts[chain] != address(0), "Bridge contract not set");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        if (chain == Chain.Avalanche) {
            balances[token].avalanche += amount;
        } else if (chain == Chain.Solana) {
            balances[token].solana += amount;
        } else if (chain == Chain.Bitcoin) {
            balances[token].bitcoin += amount;
        }

        emit Deposit(token, amount, chain);
    }

    function withdraw(
        address token,
        uint256 amount,
        Chain chain
    ) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");

        if (chain == Chain.Avalanche) {
            require(balances[token].avalanche >= amount, "Insufficient balance");
            balances[token].avalanche -= amount;
        } else if (chain == Chain.Solana) {
            require(balances[token].solana >= amount, "Insufficient balance");
            balances[token].solana -= amount;
        } else if (chain == Chain.Bitcoin) {
            require(balances[token].bitcoin >= amount, "Insufficient balance");
            balances[token].bitcoin -= amount;
        }

        IERC20(token).safeTransfer(owner(), amount);
        emit Withdraw(token, amount, chain);
    }

    function getBalance(
        address token,
        Chain chain
    ) external view returns (uint256) {
        if (chain == Chain.Avalanche) {
            return balances[token].avalanche;
        } else if (chain == Chain.Solana) {
            return balances[token].solana;
        } else if (chain == Chain.Bitcoin) {
            return balances[token].bitcoin;
        }
        return 0;
    }
} 