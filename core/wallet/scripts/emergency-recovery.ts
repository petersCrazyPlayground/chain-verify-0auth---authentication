import { ethers } from "hardhat";
import { MultiChainWallet } from "../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();
  const walletAddress = process.env.WALLET_ADDRESS;
  
  if (!walletAddress) {
    throw new Error("WALLET_ADDRESS environment variable is not set");
  }

  const wallet = await ethers.getContractAt("MultiChainWallet", walletAddress) as MultiChainWallet;

  // Set emergency recovery address
  async function setRecoveryAddress(recoveryAddress: string) {
    console.log(`Setting emergency recovery address to ${recoveryAddress}...`);
    const tx = await wallet.setEmergencyRecovery(recoveryAddress);
    await tx.wait();
    console.log("Recovery address set successfully");
    console.log("Note: Recovery will be available after 3 days");
  }

  // Activate emergency recovery
  async function activateRecovery(userAddress: string) {
    console.log(`Activating emergency recovery for ${userAddress}...`);
    const tx = await wallet.activateEmergencyRecovery(userAddress);
    await tx.wait();
    console.log("Emergency recovery activated successfully");
  }

  // Perform emergency withdrawal
  async function emergencyWithdraw(tokenAddress: string, chain: string, userAddress: string) {
    console.log(`Performing emergency withdrawal for ${userAddress}...`);
    const tx = await wallet.emergencyWithdraw(tokenAddress, chain, userAddress);
    await tx.wait();
    console.log("Emergency withdrawal completed successfully");
  }

  // Get recovery status
  async function getRecoveryStatus(userAddress: string) {
    const recovery = await wallet.emergencyRecovery(userAddress);
    console.log("\nRecovery Status:");
    console.log("----------------");
    console.log(`User: ${userAddress}`);
    console.log(`Recovery Address: ${recovery.recoveryAddress}`);
    console.log(`Activation Time: ${new Date(Number(recovery.activationTime) * 1000).toISOString()}`);
    console.log(`Is Active: ${recovery.isActive}`);
    console.log(`Time Until Available: ${recovery.isActive ? "Already active" : 
      `${Math.max(0, (Number(recovery.activationTime) - Math.floor(Date.now() / 1000)) / 86400).toFixed(2)} days`}`);
  }

  // Example usage
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "set":
      await setRecoveryAddress(args[1]);
      break;
    case "activate":
      await activateRecovery(args[1]);
      break;
    case "withdraw":
      await emergencyWithdraw(args[1], args[2], args[3]);
      break;
    case "status":
      await getRecoveryStatus(args[1]);
      break;
    default:
      console.log("Usage:");
      console.log("  set <recoveryAddress>");
      console.log("  activate <userAddress>");
      console.log("  withdraw <tokenAddress> <chain> <userAddress>");
      console.log("  status <userAddress>");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 