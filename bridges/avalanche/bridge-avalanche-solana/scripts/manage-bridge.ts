import { ethers } from "hardhat";
import { AvalancheSolanaBridge } from "../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();
  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  
  if (!bridgeAddress) {
    throw new Error("BRIDGE_ADDRESS environment variable is not set");
  }

  const bridge = await ethers.getContractAt("AvalancheSolanaBridge", bridgeAddress) as AvalancheSolanaBridge;

  // Pause bridge operations
  async function pauseBridge() {
    console.log("Pausing bridge operations...");
    const tx = await bridge.pause();
    await tx.wait();
    console.log("Bridge paused successfully");
  }

  // Resume bridge operations
  async function resumeBridge() {
    console.log("Resuming bridge operations...");
    const tx = await bridge.resume();
    await tx.wait();
    console.log("Bridge resumed successfully");
  }

  // Update bridge parameters
  async function updateParameters(
    minConfirmations: number,
    maxDailyTransfers: number,
    feePercentage: number
  ) {
    console.log("Updating bridge parameters...");
    const tx = await bridge.updateParameters(
      minConfirmations,
      maxDailyTransfers,
      feePercentage
    );
    await tx.wait();
    console.log("Bridge parameters updated successfully");
  }

  // Get bridge status
  async function getBridgeStatus() {
    const isPaused = await bridge.paused();
    const minConfirmations = await bridge.minConfirmations();
    const maxDailyTransfers = await bridge.maxDailyTransfers();
    const feePercentage = await bridge.feePercentage();
    const totalTransfers = await bridge.totalTransfers();
    const dailyTransfers = await bridge.dailyTransfers();

    console.log("\nBridge Status:");
    console.log("--------------");
    console.log(`Paused: ${isPaused}`);
    console.log(`Min Confirmations: ${minConfirmations}`);
    console.log(`Max Daily Transfers: ${maxDailyTransfers}`);
    console.log(`Fee Percentage: ${feePercentage}%`);
    console.log(`Total Transfers: ${totalTransfers}`);
    console.log(`Daily Transfers: ${dailyTransfers}`);
  }

  // Get transfer information
  async function getTransferInfo(transferId: string) {
    const transfer = await bridge.transfers(transferId);
    console.log("\nTransfer Information:");
    console.log("-------------------");
    console.log(`ID: ${transferId}`);
    console.log(`Sender: ${transfer.sender}`);
    console.log(`Recipient: ${transfer.recipient}`);
    console.log(`Token: ${transfer.token}`);
    console.log(`Amount: ${ethers.formatUnits(transfer.amount, 6)}`);
    console.log(`Status: ${transfer.status}`);
    console.log(`Created At: ${new Date(transfer.createdAt * 1000).toISOString()}`);
    console.log(`Completed At: ${transfer.completedAt ? new Date(transfer.completedAt * 1000).toISOString() : "N/A"}`);
  }

  // Example usage
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "pause":
      await pauseBridge();
      break;
    case "resume":
      await resumeBridge();
      break;
    case "update":
      await updateParameters(Number(args[1]), Number(args[2]), Number(args[3]));
      break;
    case "status":
      await getBridgeStatus();
      break;
    case "transfer":
      await getTransferInfo(args[1]);
      break;
    default:
      console.log("Usage:");
      console.log("  pause");
      console.log("  resume");
      console.log("  update <minConfirmations> <maxDailyTransfers> <feePercentage>");
      console.log("  status");
      console.log("  transfer <transferId>");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 