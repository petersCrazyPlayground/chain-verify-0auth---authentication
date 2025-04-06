import { expect } from "chai";
import { ethers } from "hardhat";
import { AvalancheSolanaBridge } from "../typechain-types";

describe("AvalancheSolanaBridge", function () {
  let bridge: AvalancheSolanaBridge;
  let owner: any;
  let user: any;
  let token: any;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("ERC20Mock");
    token = await Token.deploy("Test Token", "TT", 18);
    await token.waitForDeployment();
    
    const Bridge = await ethers.getContractFactory("AvalancheSolanaBridge");
    bridge = await Bridge.deploy();
    await bridge.waitForDeployment();

    // Add token to supported tokens
    await bridge.addSupportedToken(await token.getAddress());
  });

  it("Should deploy with correct owner", async function () {
    expect(await bridge.owner()).to.equal(owner.address);
  });

  it("Should allow owner to add supported tokens", async function () {
    const newToken = await (await ethers.getContractFactory("ERC20Mock")).deploy("New Token", "NT", 18);
    await newToken.waitForDeployment();
    
    await bridge.addSupportedToken(await newToken.getAddress());
    expect(await bridge.supportedTokens(await newToken.getAddress())).to.be.true;
  });

  it("Should allow owner to remove supported tokens", async function () {
    await bridge.removeSupportedToken(await token.getAddress());
    expect(await bridge.supportedTokens(await token.getAddress())).to.be.false;
  });

  it("Should allow users to initiate bridge transfers", async function () {
    const amount = ethers.parseEther("1");
    const solanaAddress = ethers.keccak256(ethers.toUtf8Bytes("test"));
    
    await token.mint(user.address, amount);
    await token.connect(user).approve(await bridge.getAddress(), amount);
    
    await expect(bridge.connect(user).initiateBridge(
      await token.getAddress(),
      amount,
      solanaAddress
    )).to.emit(bridge, "BridgeInitiated");
  });

  it("Should not allow bridge transfers with unsupported tokens", async function () {
    const amount = ethers.parseEther("1");
    const solanaAddress = ethers.keccak256(ethers.toUtf8Bytes("test"));
    const newToken = await (await ethers.getContractFactory("ERC20Mock")).deploy("New Token", "NT", 18);
    await newToken.waitForDeployment();
    
    await newToken.mint(user.address, amount);
    await newToken.connect(user).approve(await bridge.getAddress(), amount);
    
    await expect(bridge.connect(user).initiateBridge(
      await newToken.getAddress(),
      amount,
      solanaAddress
    )).to.be.revertedWith("Token not supported");
  });

  it("Should allow owner to complete bridge transfers", async function () {
    const amount = ethers.parseEther("1");
    const solanaAddress = ethers.keccak256(ethers.toUtf8Bytes("test"));
    
    await token.mint(user.address, amount);
    await token.connect(user).approve(await bridge.getAddress(), amount);
    
    const tx = await bridge.connect(user).initiateBridge(
      await token.getAddress(),
      amount,
      solanaAddress
    );
    
    const receipt = await tx.wait();
    const event = receipt.logs[0];
    const transactionId = ethers.dataSlice(event.data, 0, 32);
    
    await expect(bridge.completeBridge(transactionId))
      .to.emit(bridge, "BridgeCompleted");
  });

  it("Should not allow non-owner to complete bridge transfers", async function () {
    const amount = ethers.parseEther("1");
    const solanaAddress = ethers.keccak256(ethers.toUtf8Bytes("test"));
    
    await token.mint(user.address, amount);
    await token.connect(user).approve(await bridge.getAddress(), amount);
    
    const tx = await bridge.connect(user).initiateBridge(
      await token.getAddress(),
      amount,
      solanaAddress
    );
    
    const receipt = await tx.wait();
    const event = receipt.logs[0];
    const transactionId = ethers.dataSlice(event.data, 0, 32);
    
    await expect(bridge.connect(user).completeBridge(transactionId))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should allow owner to withdraw tokens", async function () {
    const amount = ethers.parseEther("1");
    await token.mint(await bridge.getAddress(), amount);
    
    await expect(bridge.withdrawTokens(await token.getAddress(), amount))
      .to.changeTokenBalance(token, owner, amount);
  });
}); 