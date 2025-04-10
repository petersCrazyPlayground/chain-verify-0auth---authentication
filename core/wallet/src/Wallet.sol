// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MultiChainWallet is Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    struct ChainInfo {
        bool isSupported;
        address bridge;
        uint256 minDeposit;
        uint256 maxDeposit;
        uint256 dailyLimit;
        uint256 dailyUsage;
        uint256 lastResetTime;
    }
    
    struct EmergencyRecovery {
        address recoveryAddress;
        uint256 activationTime;
        bool isActive;
    }

    struct TransactionLimit {
        uint256 maxAmount;
        uint256 timeWindow;
        uint256 lastTransactionTime;
        uint256 transactionCount;
    }
    
    mapping(string => ChainInfo) public supportedChains;
    mapping(address => mapping(string => uint256)) public balances;
    mapping(address => EmergencyRecovery) public emergencyRecovery;
    mapping(address => bool) public isBlacklisted;
    mapping(address => TransactionLimit) public transactionLimits;
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isOperator;
    mapping(bytes32 => bool) public usedSignatures;
    
    Counters.Counter private _transactionIdCounter;
    
    uint256 public constant MIN_RECOVERY_DELAY = 3 days;
    uint256 public constant DAILY_RESET_TIME = 24 hours;
    uint256 public constant MAX_TRANSACTIONS_PER_WINDOW = 10;
    uint256 public constant TRANSACTION_WINDOW = 1 hours;
    
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
    event EmergencyRecoverySet(address indexed user, address indexed recoveryAddress);
    event EmergencyRecoveryActivated(address indexed user, address indexed recoveryAddress);
    event BlacklistUpdated(address indexed user, bool isBlacklisted);
    event ChainLimitsUpdated(
        string indexed chain,
        uint256 minDeposit,
        uint256 maxDeposit,
        uint256 dailyLimit
    );
    event AdminUpdated(address indexed admin, bool isAdmin);
    event OperatorUpdated(address indexed operator, bool isOperator);
    event TransactionLimitUpdated(
        address indexed user,
        uint256 maxAmount,
        uint256 timeWindow
    );

    constructor() Ownable(msg.sender) {
        isAdmin[msg.sender] = true;
        emit AdminUpdated(msg.sender, true);
    }

    modifier whenNotPaused() override {
        require(!paused(), "Contract is paused");
        _;
    }

    modifier notBlacklisted(address user) {
        require(!isBlacklisted[user], "User is blacklisted");
        _;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Caller is not an admin");
        _;
    }

    modifier onlyOperator() {
        require(isOperator[msg.sender] || isAdmin[msg.sender], "Caller is not an operator");
        _;
    }

    function addChain(
        string memory chain,
        address bridge,
        uint256 minDeposit,
        uint256 maxDeposit,
        uint256 dailyLimit
    ) external onlyAdmin {
        require(!supportedChains[chain].isSupported, "Chain already supported");
        require(minDeposit <= maxDeposit, "Invalid deposit limits");
        require(dailyLimit > 0, "Invalid daily limit");
        
        supportedChains[chain] = ChainInfo({
            isSupported: true,
            bridge: bridge,
            minDeposit: minDeposit,
            maxDeposit: maxDeposit,
            dailyLimit: dailyLimit,
            dailyUsage: 0,
            lastResetTime: block.timestamp
        });
        
        emit ChainAdded(chain, bridge);
    }

    function removeChain(string memory chain) external onlyAdmin {
        require(supportedChains[chain].isSupported, "Chain not supported");
        delete supportedChains[chain];
        emit ChainRemoved(chain);
    }

    function updateChainLimits(
        string memory chain,
        uint256 minDeposit,
        uint256 maxDeposit,
        uint256 dailyLimit
    ) external onlyAdmin {
        require(supportedChains[chain].isSupported, "Chain not supported");
        require(minDeposit <= maxDeposit, "Invalid deposit limits");
        require(dailyLimit > 0, "Invalid daily limit");
        
        ChainInfo storage info = supportedChains[chain];
        info.minDeposit = minDeposit;
        info.maxDeposit = maxDeposit;
        info.dailyLimit = dailyLimit;
        
        emit ChainLimitsUpdated(chain, minDeposit, maxDeposit, dailyLimit);
    }

    function deposit(
        address token,
        string memory chain,
        uint256 amount,
        bytes32 signature
    ) external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        require(!usedSignatures[signature], "Signature already used");
        usedSignatures[signature] = true;

        ChainInfo storage info = supportedChains[chain];
        require(info.isSupported, "Chain not supported");
        require(amount >= info.minDeposit, "Amount below minimum");
        require(amount <= info.maxDeposit, "Amount above maximum");
        
        _resetDailyUsageIfNeeded(chain);
        require(info.dailyUsage + amount <= info.dailyLimit, "Daily limit exceeded");
        
        _checkTransactionLimits(msg.sender, amount);
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender][chain] += amount;
        info.dailyUsage += amount;
        
        emit Deposit(msg.sender, chain, amount);
    }

    function withdraw(
        address token,
        string memory chain,
        uint256 amount,
        bytes32 signature
    ) external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        require(!usedSignatures[signature], "Signature already used");
        usedSignatures[signature] = true;

        require(supportedChains[chain].isSupported, "Chain not supported");
        require(balances[msg.sender][chain] >= amount, "Insufficient balance");
        
        _checkTransactionLimits(msg.sender, amount);
        
        balances[msg.sender][chain] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        
        emit Withdrawal(msg.sender, chain, amount);
    }

    function transfer(
        address token,
        address to,
        string memory chain,
        uint256 amount,
        bytes32 signature
    ) external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        require(!usedSignatures[signature], "Signature already used");
        usedSignatures[signature] = true;

        require(supportedChains[chain].isSupported, "Chain not supported");
        require(balances[msg.sender][chain] >= amount, "Insufficient balance");
        require(!isBlacklisted[to], "Recipient is blacklisted");
        
        _checkTransactionLimits(msg.sender, amount);
        
        balances[msg.sender][chain] -= amount;
        balances[to][chain] += amount;
        
        emit Transfer(msg.sender, to, chain, amount);
    }

    function setEmergencyRecovery(address recoveryAddress) external {
        require(recoveryAddress != address(0), "Invalid recovery address");
        emergencyRecovery[msg.sender] = EmergencyRecovery({
            recoveryAddress: recoveryAddress,
            activationTime: block.timestamp + MIN_RECOVERY_DELAY,
            isActive: false
        });
        emit EmergencyRecoverySet(msg.sender, recoveryAddress);
    }

    function activateEmergencyRecovery(address user) external {
        EmergencyRecovery storage recovery = emergencyRecovery[user];
        require(recovery.recoveryAddress == msg.sender, "Not authorized");
        require(block.timestamp >= recovery.activationTime, "Recovery not ready");
        require(!recovery.isActive, "Recovery already active");
        
        recovery.isActive = true;
        emit EmergencyRecoveryActivated(user, msg.sender);
    }

    function emergencyWithdraw(
        address token,
        string memory chain,
        address user
    ) external nonReentrant {
        EmergencyRecovery storage recovery = emergencyRecovery[user];
        require(recovery.isActive, "Recovery not active");
        require(recovery.recoveryAddress == msg.sender, "Not authorized");
        
        uint256 amount = balances[user][chain];
        require(amount > 0, "No balance to withdraw");
        
        balances[user][chain] = 0;
        IERC20(token).transfer(msg.sender, amount);
    }

    function updateBlacklist(address user, bool blacklisted) external onlyOperator {
        isBlacklisted[user] = blacklisted;
        emit BlacklistUpdated(user, blacklisted);
    }

    function setAdmin(address admin, bool isAdmin_) external onlyOwner {
        isAdmin[admin] = isAdmin_;
        emit AdminUpdated(admin, isAdmin_);
    }

    function setOperator(address operator, bool isOperator_) external onlyAdmin {
        isOperator[operator] = isOperator_;
        emit OperatorUpdated(operator, isOperator_);
    }

    function setTransactionLimit(
        address user,
        uint256 maxAmount,
        uint256 timeWindow
    ) external onlyOperator {
        transactionLimits[user] = TransactionLimit({
            maxAmount: maxAmount,
            timeWindow: timeWindow,
            lastTransactionTime: block.timestamp,
            transactionCount: 0
        });
        emit TransactionLimitUpdated(user, maxAmount, timeWindow);
    }

    function _resetDailyUsageIfNeeded(string memory chain) private {
        ChainInfo storage info = supportedChains[chain];
        if (block.timestamp >= info.lastResetTime + DAILY_RESET_TIME) {
            info.dailyUsage = 0;
            info.lastResetTime = block.timestamp;
        }
    }

    function _checkTransactionLimits(address user, uint256 amount) private {
        TransactionLimit storage limit = transactionLimits[user];
        if (limit.maxAmount > 0) {
            require(amount <= limit.maxAmount, "Amount exceeds transaction limit");
            
            if (block.timestamp >= limit.lastTransactionTime + limit.timeWindow) {
                limit.transactionCount = 0;
                limit.lastTransactionTime = block.timestamp;
            }
            
            require(limit.transactionCount < MAX_TRANSACTIONS_PER_WINDOW, "Too many transactions");
            limit.transactionCount++;
        }
    }

    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }
} 