import { expect } from "chai";
import { ethers } from "hardhat";
import { AvalanchePolygonBridge } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("AvalanchePolygonBridge", function () {
    let bridge: AvalanchePolygonBridge;
    let owner: SignerWithAddress;
    let validator1: SignerWithAddress;
    let validator2: SignerWithAddress;
    let validator3: SignerWithAddress;
    let user: SignerWithAddress;
    let token: any;
    let polygonToken: any;
    const initialSupply = ethers.utils.parseUnits("1000000", 18);

    beforeEach(async function () {
        [owner, validator1, validator2, validator3, user] = await ethers.getSigners();

        // Deploy mock ERC20 tokens
        const Token = await ethers.getContractFactory("ERC20Mock");
        token = await Token.deploy("Test Token", "TEST", initialSupply);
        await token.deployed();

        polygonToken = await Token.deploy("Polygon Test Token", "PTEST", initialSupply);
        await polygonToken.deployed();

        // Deploy bridge with initial validators
        const Bridge = await ethers.getContractFactory("AvalanchePolygonBridge");
        bridge = await Bridge.deploy([
            validator1.address,
            validator2.address,
            validator3.address
        ]);
        await bridge.deployed();

        // Add token to bridge
        await bridge.addSupportedToken(
            token.address,
            polygonToken.address,
            ethers.utils.parseUnits("1", 18), // min: 1 token
            ethers.utils.parseUnits("1000", 18), // max: 1000 tokens
            ethers.utils.parseUnits("10000", 18) // daily limit: 10000 tokens
        );

        // Approve bridge to spend tokens
        await token.approve(bridge.address, ethers.utils.parseUnits("1000", 18));
    });

    describe("Token Management", function () {
        it("Should add supported token", async function () {
            const tokenInfo = await bridge.supportedTokens(token.address);
            expect(tokenInfo.isSupported).to.be.true;
            expect(tokenInfo.minAmount).to.equal(ethers.utils.parseUnits("1", 18));
            expect(tokenInfo.maxAmount).to.equal(ethers.utils.parseUnits("1000", 18));
            expect(tokenInfo.dailyLimit).to.equal(ethers.utils.parseUnits("10000", 18));
            expect(tokenInfo.polygonToken).to.equal(polygonToken.address);
        });

        it("Should remove supported token", async function () {
            await bridge.removeSupportedToken(token.address);
            const tokenInfo = await bridge.supportedTokens(token.address);
            expect(tokenInfo.isSupported).to.be.false;
            expect(await bridge.getPolygonToken(token.address)).to.equal(ethers.constants.AddressZero);
        });

        it("Should update token limits", async function () {
            await bridge.updateTokenLimits(
                token.address,
                ethers.utils.parseUnits("2", 18),
                ethers.utils.parseUnits("2000", 18),
                ethers.utils.parseUnits("20000", 18)
            );

            const tokenInfo = await bridge.supportedTokens(token.address);
            expect(tokenInfo.minAmount).to.equal(ethers.utils.parseUnits("2", 18));
            expect(tokenInfo.maxAmount).to.equal(ethers.utils.parseUnits("2000", 18));
            expect(tokenInfo.dailyLimit).to.equal(ethers.utils.parseUnits("20000", 18));
        });
    });

    describe("Bridge Operations", function () {
        it("Should initiate transfer", async function () {
            const amount = ethers.utils.parseUnits("100", 18);
            await bridge.initiateTransfer(token.address, user.address, amount);

            const tokenInfo = await bridge.supportedTokens(token.address);
            expect(tokenInfo.dailyTransferred).to.equal(amount);
        });

        it("Should complete transfer with validator consensus", async function () {
            const amount = ethers.utils.parseUnits("100", 18);
            await bridge.initiateTransfer(token.address, user.address, amount);

            const transferId = ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(
                    ["address", "address", "address", "uint256", "uint256", "uint256"],
                    [token.address, owner.address, user.address, amount, 0, 1]
                )
            );

            // Validator 1 votes
            await bridge.connect(validator1).completeTransfer(
                transferId,
                token.address,
                user.address,
                amount
            );

            // Validator 2 votes
            await bridge.connect(validator2).completeTransfer(
                transferId,
                token.address,
                user.address,
                amount
            );

            // Check if transfer was processed
            expect(await bridge.isTransferProcessed(transferId)).to.be.true;
            expect(await token.balanceOf(user.address)).to.equal(amount);
        });

        it("Should revert transfer with validator consensus", async function () {
            const amount = ethers.utils.parseUnits("100", 18);
            await bridge.initiateTransfer(token.address, user.address, amount);

            const transferId = ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(
                    ["address", "address", "address", "uint256", "uint256", "uint256"],
                    [token.address, owner.address, user.address, amount, 0, 1]
                )
            );

            // Validator 1 votes to revert
            await bridge.connect(validator1).revertTransfer(
                transferId,
                token.address,
                owner.address,
                amount
            );

            // Validator 2 votes to revert
            await bridge.connect(validator2).revertTransfer(
                transferId,
                token.address,
                owner.address,
                amount
            );

            // Check if transfer was reverted
            expect(await bridge.isTransferProcessed(transferId)).to.be.true;
            expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
        });
    });

    describe("Validator Management", function () {
        it("Should add validator", async function () {
            await bridge.addValidator(user.address);
            expect(await bridge.isValidator(user.address)).to.be.true;
        });

        it("Should remove validator", async function () {
            await bridge.removeValidator(validator3.address);
            expect(await bridge.isValidator(validator3.address)).to.be.false;
        });

        it("Should not remove validator if below minimum", async function () {
            await bridge.removeValidator(validator3.address);
            await expect(bridge.removeValidator(validator2.address)).to.be.revertedWith(
                "Cannot remove validator: minimum required"
            );
        });
    });
}); 