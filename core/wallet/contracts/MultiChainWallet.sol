// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MultiChainWallet is Ownable, ReentrancyGuard {
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

    // For backward compatibility with string-based chain names
    struct ChainInfo {
        bool isSupported;
        address bridge;
        Chain chainEnum;
    }

    mapping(address => WalletBalance) public balances;
    mapping(address => bool) public supportedTokens;
    mapping(Chain => address) public bridgeContracts;
    mapping(string => ChainInfo) public supportedChains;
    mapping(address => mapping(string => uint256)) public legacyBalances;

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
    event Transfer(
        address indexed from,
        address indexed to,
        address indexed token,
        uint256 amount,
        Chain chain
    );
    event ChainAdded(string indexed chain, address indexed bridge, Chain chainEnum);
    event ChainRemoved(string indexed chain);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);

    constructor() Ownable(msg.sender) {}

    // Chain Management
    function addChain(string memory chain, address bridge, Chain chainEnum) external onlyOwner {
        require(!supportedChains[chain].isSupported, "Chain already supported");
        supportedChains[chain] = ChainInfo(true, bridge, chainEnum);
        bridgeContracts[chainEnum] = bridge;
        emit ChainAdded(chain, bridge, chainEnum);
    }

    function removeChain(string memory chain) external onlyOwner {
        require(supportedChains[chain].isSupported, "Chain not supported");
        Chain chainEnum = supportedChains[chain].chainEnum;
        delete supportedChains[chain];
        delete bridgeContracts[chainEnum];
        emit ChainRemoved(chain);
    }

    // Token Management
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    // Bridge Management
    function setBridgeContract(Chain chain, address bridge) external onlyOwner {
        bridgeContracts[chain] = bridge;
    }

    // Deposit Functions
    function deposit(
        address token,
        uint256 amount,
        Chain chain
    ) external nonReentrant {
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

    // Legacy deposit function for backward compatibility
    function deposit(
        address token,
        string memory chain,
        uint256 amount
    ) external nonReentrant {
        require(supportedChains[chain].isSupported, "Chain not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        legacyBalances[msg.sender][chain] += amount;
        
        emit Deposit(token, amount, supportedChains[chain].chainEnum);
    }

    // Withdraw Functions
    function withdraw(
        address token,
        uint256 amount,
        Chain chain
    ) external nonReentrant {
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

        IERC20(token).safeTransfer(msg.sender, amount);
        emit Withdraw(token, amount, chain);
    }

    // Legacy withdraw function for backward compatibility
    function withdraw(
        address token,
        string memory chain,
        uint256 amount
    ) external nonReentrant {
        require(supportedChains[chain].isSupported, "Chain not supported");
        require(legacyBalances[msg.sender][chain] >= amount, "Insufficient balance");
        
        legacyBalances[msg.sender][chain] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit Withdraw(token, amount, supportedChains[chain].chainEnum);
    }

    // Transfer Functions
    function transfer(
        address token,
        address to,
        Chain chain,
        uint256 amount
    ) external nonReentrant {
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

        emit Transfer(msg.sender, to, token, amount, chain);
    }

    // Legacy transfer function for backward compatibility
    function transfer(
        address token,
        address to,
        string memory chain,
        uint256 amount
    ) external nonReentrant {
        require(supportedChains[chain].isSupported, "Chain not supported");
        require(legacyBalances[msg.sender][chain] >= amount, "Insufficient balance");
        
        legacyBalances[msg.sender][chain] -= amount;
        legacyBalances[to][chain] += amount;
        
        emit Transfer(msg.sender, to, token, amount, supportedChains[chain].chainEnum);
    }

    // View Functions
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

    // Legacy balance function for backward compatibility
    function getBalance(
        address user,
        string memory chain
    ) external view returns (uint256) {
        return legacyBalances[user][chain];
    }
} 