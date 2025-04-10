import { ethers } from "hardhat";
import { AvalanchePolygonBridge } from "../typechain-types";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Initial validators (replace with actual validator addresses)
    const initialValidators = [
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
    ];

    // Deploy the bridge contract
    const Bridge = await ethers.getContractFactory("AvalanchePolygonBridge");
    const bridge = await Bridge.deploy(initialValidators);
    await bridge.deployed();

    console.log("AvalanchePolygonBridge deployed to:", bridge.address);

    // Initialize with some default tokens (USDC and USDT)
    const defaultTokens = [
        {
            avalancheAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48d6e", // USDC on Avalanche
            polygonAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
            minAmount: ethers.utils.parseUnits("10", 6), // $10
            maxAmount: ethers.utils.parseUnits("100000", 6), // $100,000
            dailyLimit: ethers.utils.parseUnits("1000000", 6) // $1,000,000
        },
        {
            avalancheAddress: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", // USDT on Avalanche
            polygonAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8f", // USDT on Polygon
            minAmount: ethers.utils.parseUnits("10", 6), // $10
            maxAmount: ethers.utils.parseUnits("100000", 6), // $100,000
            dailyLimit: ethers.utils.parseUnits("1000000", 6) // $1,000,000
        }
    ];

    // Add supported tokens
    for (const token of defaultTokens) {
        await bridge.addSupportedToken(
            token.avalancheAddress,
            token.polygonAddress,
            token.minAmount,
            token.maxAmount,
            token.dailyLimit
        );
        console.log(`Added token pair:
            Avalanche: ${token.avalancheAddress}
            Polygon: ${token.polygonAddress}
            Limits:
                Min: ${ethers.utils.formatUnits(token.minAmount, 6)}
                Max: ${ethers.utils.formatUnits(token.maxAmount, 6)}
                Daily: ${ethers.utils.formatUnits(token.dailyLimit, 6)}
        `);
    }

    // Verify the contract
    try {
        await hre.run("verify:verify", {
            address: bridge.address,
            constructorArguments: [initialValidators],
        });
        console.log("Contract verified successfully");
    } catch (error) {
        console.error("Contract verification failed:", error);
    }

    // Print deployment summary
    console.log("\nDeployment Summary:");
    console.log("------------------");
    console.log("Bridge Address:", bridge.address);
    console.log("Deployer Address:", deployer.address);
    console.log("\nInitial Validators:");
    initialValidators.forEach((validator, index) => {
        console.log(`${index + 1}. ${validator}`);
    });
    console.log("\nSupported Token Pairs:");
    defaultTokens.forEach((token, index) => {
        console.log(`${index + 1}. Avalanche: ${token.avalancheAddress} -> Polygon: ${token.polygonAddress}`);
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 