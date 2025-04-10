const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AvalancheSKALEBridge", function () {
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
    const AvalancheSKALEBridge = await ethers.getContractFactory("AvalancheSKALEBridge");
    bridge = await AvalancheSKALEBridge.deploy();
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
      const destinationAddress = ethers.randomBytes(32);
      const lockTime = 3600; // 1 hour

      // Approve bridge to spend tokens
      await token.approve(await bridge.getAddress(), amount);

      // Initiate bridge
      await expect(bridge.initiateBridge(
        await token.getAddress(),
        amount,
        destinationAddress,
        lockTime
      ))
        .to.emit(bridge, "BridgeInitiated")
        .withArgs(anyValue, await token.getAddress(), amount, destinationAddress, lockTime);
    });

    it("Should complete bridge transfer", async function () {
      const amount = ethers.parseEther("1");
      const destinationAddress = ethers.randomBytes(32);
      const lockTime = 3600;

      // Approve and initiate bridge
      await token.approve(await bridge.getAddress(), amount);
      const tx = await bridge.initiateBridge(
        await token.getAddress(),
        amount,
        destinationAddress,
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
      const destinationAddress = ethers.randomBytes(32);
      const lockTime = 1; // 1 second

      // Approve and initiate bridge
      await token.approve(await bridge.getAddress(), amount);
      const tx = await bridge.initiateBridge(
        await token.getAddress(),
        amount,
        destinationAddress,
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