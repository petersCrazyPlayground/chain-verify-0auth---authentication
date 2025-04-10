import { ethers } from "hardhat";
import { AvalancheBitcoinBridge } from "../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Managing emergency functions with account:", signer.address);

  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  if (!bridgeAddress) {
    throw new Error("BRIDGE_ADDRESS environment variable is not set");
  }

  const bridge = await ethers.getContractAt("AvalancheBitcoinBridge", bridgeAddress) as AvalancheBitcoinBridge;

  const action = process.argv[2];

  switch (action) {
    case "pause":
      console.log("Pausing bridge...");
      const pauseTx = await bridge.pause();
      await pauseTx.wait();
      console.log("Bridge paused successfully");
      break;

    case "unpause":
      console.log("Unpausing bridge...");
      const unpauseTx = await bridge.unpause();
      await unpauseTx.wait();
      console.log("Bridge unpaused successfully");
      break;

    case "withdraw":
      const tokenAddress = process.argv[3];
      if (!tokenAddress) {
        throw new Error("Token address is required");
      }

      console.log("Performing emergency withdrawal...");
      const withdrawTx = await bridge.emergencyWithdraw(tokenAddress);
      await withdrawTx.wait();
      console.log("Emergency withdrawal completed successfully");
      break;

    case "status":
      const isPaused = await bridge.paused();
      console.log("\nBridge Status:");
      console.log("--------------");
      console.log("Paused:", isPaused);
      console.log("Owner:", await bridge.owner());
      break;

    default:
      console.log("Usage: npm run manage-emergency <action> [params]");
      console.log("Actions:");
      console.log("  pause");
      console.log("  unpause");
      console.log("  withdraw <token-address>");
      console.log("  status");
      process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 