import { ethers } from "hardhat";
import { AvalancheBitcoinBridge } from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the bridge
  const Bridge = await ethers.getContractFactory("AvalancheBitcoinBridge");
  const bridge = await Bridge.deploy();
  await bridge.waitForDeployment();
  console.log("Bridge deployed to:", await bridge.getAddress());

  // Initialize bridge with some default tokens
  const tokens = [
    {
      address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // USDC on Avalanche
      minAmount: ethers.parseUnits("10", 6), // 10 USDC
      maxAmount: ethers.parseUnits("100000", 6), // 100,000 USDC
      dailyLimit: ethers.parseUnits("1000000", 6) // 1,000,000 USDC
    },
    {
      address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", // USDT on Avalanche
      minAmount: ethers.parseUnits("10", 6), // 10 USDT
      maxAmount: ethers.parseUnits("100000", 6), // 100,000 USDT
      dailyLimit: ethers.parseUnits("1000000", 6) // 1,000,000 USDT
    }
  ];

  // Add supported tokens
  for (const token of tokens) {
    console.log(`Adding token ${token.address}...`);
    const tx = await bridge.addSupportedToken(
      token.address,
      token.minAmount,
      token.maxAmount,
      token.dailyLimit
    );
    await tx.wait();
    console.log(`Token ${token.address} added successfully`);
  }

  // Verify the bridge
  console.log("Verifying bridge...");
  try {
    await hre.run("verify:verify", {
      address: await bridge.getAddress(),
      constructorArguments: [],
    });
    console.log("Bridge verified successfully");
  } catch (error) {
    console.error("Verification failed:", error);
  }

  // Print deployment summary
  console.log("\nDeployment Summary:");
  console.log("------------------");
  console.log("Bridge Address:", await bridge.getAddress());
  console.log("Deployer Address:", deployer.address);
  console.log("\nSupported Tokens:");
  for (const token of tokens) {
    const info = await bridge.tokenInfo(token.address);
    console.log(`\nToken: ${token.address}`);
    console.log(`- Min Amount: ${ethers.formatUnits(info.minAmount, 6)}`);
    console.log(`- Max Amount: ${ethers.formatUnits(info.maxAmount, 6)}`);
    console.log(`- Daily Limit: ${ethers.formatUnits(info.dailyLimit, 6)}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 