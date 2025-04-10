import { ethers } from "hardhat";
import { MultiChainWallet } from "../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();
  const walletAddress = process.env.WALLET_ADDRESS;
  
  if (!walletAddress) {
    throw new Error("WALLET_ADDRESS environment variable is not set");
  }

  const wallet = await ethers.getContractAt("MultiChainWallet", walletAddress) as MultiChainWallet;

  // Set transaction limits for a user
  async function setTransactionLimit(
    userAddress: string,
    maxAmount: string,
    timeWindow: string
  ) {
    console.log(`Setting transaction limits for ${userAddress}...`);
    const tx = await wallet.setTransactionLimit(
      userAddress,
      ethers.parseUnits(maxAmount, 18),
      parseInt(timeWindow) * 3600 // Convert hours to seconds
    );
    await tx.wait();
    console.log("Transaction limits set successfully");
  }

  // Get transaction limits for a user
  async function getTransactionLimits(userAddress: string) {
    const limit = await wallet.transactionLimits(userAddress);
    console.log("\nTransaction Limits:");
    console.log("-----------------");
    console.log(`User: ${userAddress}`);
    console.log(`Max Amount: ${ethers.formatUnits(limit.maxAmount, 18)}`);
    console.log(`Time Window: ${limit.timeWindow / 3600} hours`);
    console.log(`Last Transaction Time: ${new Date(Number(limit.lastTransactionTime) * 1000).toISOString()}`);
    console.log(`Transaction Count: ${limit.transactionCount}`);
    
    if (limit.maxAmount > 0) {
      const timeSinceLastTx = Math.floor(Date.now() / 1000) - Number(limit.lastTransactionTime);
      const windowRemaining = Math.max(0, limit.timeWindow - timeSinceLastTx);
      console.log(`\nCurrent Status:`);
      console.log(`Time Since Last Transaction: ${(timeSinceLastTx / 3600).toFixed(2)} hours`);
      console.log(`Window Remaining: ${(windowRemaining / 3600).toFixed(2)} hours`);
      console.log(`Transactions Available: ${10 - limit.transactionCount}`);
    }
  }

  // Monitor transaction activity
  async function monitorTransactions(userAddress: string, duration: string) {
    console.log(`\nMonitoring transactions for ${userAddress}...`);
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + (parseInt(duration) * 3600);
    
    console.log(`Monitoring period: ${duration} hours`);
    console.log(`Start Time: ${new Date(startTime * 1000).toISOString()}`);
    console.log(`End Time: ${new Date(endTime * 1000).toISOString()}`);
    
    // Note: In a real implementation, you would want to:
    // 1. Set up event listeners for transactions
    // 2. Track transaction counts and amounts
    // 3. Alert on suspicious activity
    // 4. Store monitoring data for analysis
    
    console.log("\nNote: This is a placeholder for transaction monitoring.");
    console.log("In a production environment, you would implement:");
    console.log("- Real-time event monitoring");
    console.log("- Transaction pattern analysis");
    console.log("- Suspicious activity detection");
    console.log("- Automated alerts");
  }

  // Example usage
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "set":
      await setTransactionLimit(args[1], args[2], args[3]);
      break;
    case "get":
      await getTransactionLimits(args[1]);
      break;
    case "monitor":
      await monitorTransactions(args[1], args[2]);
      break;
    default:
      console.log("Usage:");
      console.log("  set <userAddress> <maxAmount> <timeWindowInHours>");
      console.log("  get <userAddress>");
      console.log("  monitor <userAddress> <durationInHours>");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 