import { ethers } from "hardhat";
import { AvalancheSolanaBridge } from "../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();
  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  
  if (!bridgeAddress) {
    throw new Error("BRIDGE_ADDRESS environment variable is not set");
  }

  const bridge = await ethers.getContractAt("AvalancheSolanaBridge", bridgeAddress) as AvalancheSolanaBridge;

  // Add a new supported token
  async function addToken(
    tokenAddress: string,
    minAmount: string,
    maxAmount: string,
    dailyLimit: string
  ) {
    console.log(`Adding token ${tokenAddress}...`);
    const tx = await bridge.addSupportedToken(
      tokenAddress,
      ethers.parseUnits(minAmount, 6),
      ethers.parseUnits(maxAmount, 6),
      ethers.parseUnits(dailyLimit, 6)
    );
    await tx.wait();
    console.log("Token added successfully");
  }

  // Remove a supported token
  async function removeToken(tokenAddress: string) {
    console.log(`Removing token ${tokenAddress}...`);
    const tx = await bridge.removeSupportedToken(tokenAddress);
    await tx.wait();
    console.log("Token removed successfully");
  }

  // Update token limits
  async function updateTokenLimits(
    tokenAddress: string,
    minAmount: string,
    maxAmount: string,
    dailyLimit: string
  ) {
    console.log(`Updating limits for token ${tokenAddress}...`);
    const tx = await bridge.updateTokenLimits(
      tokenAddress,
      ethers.parseUnits(minAmount, 6),
      ethers.parseUnits(maxAmount, 6),
      ethers.parseUnits(dailyLimit, 6)
    );
    await tx.wait();
    console.log("Token limits updated successfully");
  }

  // Get token information
  async function getTokenInfo(tokenAddress: string) {
    const info = await bridge.tokenInfo(tokenAddress);
    console.log("\nToken Information:");
    console.log("------------------");
    console.log(`Address: ${tokenAddress}`);
    console.log(`Min Amount: ${ethers.formatUnits(info.minAmount, 6)}`);
    console.log(`Max Amount: ${ethers.formatUnits(info.maxAmount, 6)}`);
    console.log(`Daily Limit: ${ethers.formatUnits(info.dailyLimit, 6)}`);
    console.log(`Is Supported: ${info.isSupported}`);
  }

  // Example usage
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "add":
      await addToken(args[1], args[2], args[3], args[4]);
      break;
    case "remove":
      await removeToken(args[1]);
      break;
    case "update":
      await updateTokenLimits(args[1], args[2], args[3], args[4]);
      break;
    case "info":
      await getTokenInfo(args[1]);
      break;
    default:
      console.log("Usage:");
      console.log("  add <tokenAddress> <minAmount> <maxAmount> <dailyLimit>");
      console.log("  remove <tokenAddress>");
      console.log("  update <tokenAddress> <minAmount> <maxAmount> <dailyLimit>");
      console.log("  info <tokenAddress>");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 