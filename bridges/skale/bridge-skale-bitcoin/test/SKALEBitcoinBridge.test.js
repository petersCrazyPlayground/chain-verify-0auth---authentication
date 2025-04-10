const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SKALEBitcoinBridge", function () {
  let bridge;
  let owner;
  let user;
  let token;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    // Deploy mock token
    const MockToken = await ethers.getContractFactory("MockToken");
    token = await MockToken.deploy("Mock Token", "MTK");
    await token.waitForDeployment();

    // Deploy bridge
    const SKALEBitcoinBridge = await ethers.getContractFactory("SKALEBitcoinBridge");
    bridge = await SKALEBitcoinBridge.deploy();
    await bridge.waitForDeployment();

    // Add token to supported tokens
    await bridge.addSupportedToken(await token.getAddress());
  });

  describe("Token Management", function () {
    it("Should add supported token", async function () {
      expect(await bridge.supportedTokens(await token.getAddress())).to.be.true;
    });

    it("Should remove supported token", async function () {
      await bridge.removeSupportedToken(await token.getAddress());
      expect(await bridge.supportedTokens(await token.getAddress())).to.be.false;
    });
  });

  describe("Bridge Operations", function () {
    it("Should initiate bridge transfer", async function () {
      const amount = ethers.parseEther("1");
      const bitcoinAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
      const lockTime = 3600; // 1 hour

      // Approve bridge to spend tokens
      await token.approve(await bridge.getAddress(), amount);

      // Initiate bridge
      await expect(bridge.initiateBridge(
        await token.getAddress(),
        amount,
        bitcoinAddress,
        lockTime
      ))
        .to.emit(bridge, "BridgeInitiated")
        .withArgs(anyValue, await token.getAddress(), amount, bitcoinAddress, lockTime);
    });

    it("Should complete bridge transfer", async function () {
      const amount = ethers.parseEther("1");
      const bitcoinAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
      const lockTime = 3600;

      // Approve and initiate bridge
      await token.approve(await bridge.getAddress(), amount);
      const tx = await bridge.initiateBridge(
        await token.getAddress(),
        amount,
        bitcoinAddress,
        lockTime
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "BridgeInitiated");
      const transactionId = event.args[0];

      // Complete bridge
      await expect(bridge.completeBridge(transactionId))
        .to.emit(bridge, "BridgeCompleted")
        .withArgs(transactionId);
    });

    it("Should expire bridge transfer", async function () {
      const amount = ethers.parseEther("1");
      const bitcoinAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
      const lockTime = 1; // 1 second

      // Approve and initiate bridge
      await token.approve(await bridge.getAddress(), amount);
      const tx = await bridge.initiateBridge(
        await token.getAddress(),
        amount,
        bitcoinAddress,
        lockTime
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "BridgeInitiated");
      const transactionId = event.args[0];

      // Wait for lock time to expire
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine");

      // Expire bridge
      await expect(bridge.expireBridge(transactionId))
        .to.emit(bridge, "BridgeExpired")
        .withArgs(transactionId);
    });
  });
}); 