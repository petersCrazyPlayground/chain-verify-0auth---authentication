import { ethers } from "hardhat";
import { AvalancheBitcoinBridge } from "../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Managing tokens with account:", signer.address);

  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  if (!bridgeAddress) {
    throw new Error("BRIDGE_ADDRESS environment variable is not set");
  }

  const bridge = await ethers.getContractAt("AvalancheBitcoinBridge", bridgeAddress) as AvalancheBitcoinBridge;

  const action = process.argv[2];
  const tokenAddress = process.argv[3];

  switch (action) {
    case "add":
      const minAmount = ethers.parseUnits(process.argv[4] || "10", 6);
      const maxAmount = ethers.parseUnits(process.argv[5] || "100000", 6);
      const dailyLimit = ethers.parseUnits(process.argv[6] || "1000000", 6);

      console.log("Adding token...");
      const addTx = await bridge.addSupportedToken(
        tokenAddress,
        minAmount,
        maxAmount,
        dailyLimit
      );
      await addTx.wait();
      console.log("Token added successfully");
      break;

    case "remove":
      console.log("Removing token...");
      const removeTx = await bridge.removeSupportedToken(tokenAddress);
      await removeTx.wait();
      console.log("Token removed successfully");
      break;

    case "update-limit":
      const newLimit = ethers.parseUnits(process.argv[4] || "1000000", 6);
      console.log("Updating daily limit...");
      const updateTx = await bridge.updateDailyLimit(tokenAddress, newLimit);
      await updateTx.wait();
      console.log("Daily limit updated successfully");
      break;

    case "info":
      const info = await bridge.tokenInfo(tokenAddress);
      console.log("\nToken Information:");
      console.log("------------------");
      console.log("Is Supported:", info.isSupported);
      console.log("Min Amount:", ethers.formatUnits(info.minAmount, 6));
      console.log("Max Amount:", ethers.formatUnits(info.maxAmount, 6));
      console.log("Daily Limit:", ethers.formatUnits(info.dailyLimit, 6));
      console.log("Daily Usage:", ethers.formatUnits(info.dailyUsage, 6));
      console.log("Last Reset Time:", new Date(info.lastResetTime * 1000).toISOString());
      break;

    default:
      console.log("Usage: npm run manage-tokens <action> <token-address> [params]");
      console.log("Actions:");
      console.log("  add <token-address> [min-amount] [max-amount] [daily-limit]");
      console.log("  remove <token-address>");
      console.log("  update-limit <token-address> <new-limit>");
      console.log("  info <token-address>");
      process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 