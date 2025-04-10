// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiChainWallet is Ownable, ReentrancyGuard {
    struct ChainInfo {
        bool isSupported;
        address bridge;
    }
    
    mapping(string => ChainInfo) public supportedChains;
    mapping(address => mapping(string => uint256)) public balances;
    
    event ChainAdded(string indexed chain, address indexed bridge);
    event ChainRemoved(string indexed chain);
    event Deposit(address indexed user, string indexed chain, uint256 amount);
    event Withdrawal(address indexed user, string indexed chain, uint256 amount);
    event Transfer(
        address indexed from,
        address indexed to,
        string indexed chain,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {}

    function addChain(string memory chain, address bridge) external onlyOwner {
        require(!supportedChains[chain].isSupported, "Chain already supported");
        supportedChains[chain] = ChainInfo(true, bridge);
        emit ChainAdded(chain, bridge);
    }

    function removeChain(string memory chain) external onlyOwner {
        require(supportedChains[chain].isSupported, "Chain not supported");
        delete supportedChains[chain];
        emit ChainRemoved(chain);
    }

    function deposit(
        address token,
        string memory chain,
        uint256 amount
    ) external nonReentrant {
        require(supportedChains[chain].isSupported, "Chain not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender][chain] += amount;
        
        emit Deposit(msg.sender, chain, amount);
    }

    function withdraw(
        address token,
        string memory chain,
        uint256 amount
    ) external nonReentrant {
        require(supportedChains[chain].isSupported, "Chain not supported");
        require(balances[msg.sender][chain] >= amount, "Insufficient balance");
        
        balances[msg.sender][chain] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        
        emit Withdrawal(msg.sender, chain, amount);
    }

    function transfer(
        address token,
        address to,
        string memory chain,
        uint256 amount
    ) external nonReentrant {
        require(supportedChains[chain].isSupported, "Chain not supported");
        require(balances[msg.sender][chain] >= amount, "Insufficient balance");
        
        balances[msg.sender][chain] -= amount;
        balances[to][chain] += amount;
        
        emit Transfer(msg.sender, to, chain, amount);
    }
} 