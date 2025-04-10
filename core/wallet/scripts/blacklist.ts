import { ethers } from "hardhat";
import { MultiChainWallet } from "../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();
  const walletAddress = process.env.WALLET_ADDRESS;
  
  if (!walletAddress) {
    throw new Error("WALLET_ADDRESS environment variable is not set");
  }

  const wallet = await ethers.getContractAt("MultiChainWallet", walletAddress) as MultiChainWallet;

  // Add address to blacklist
  async function addToBlacklist(address: string) {
    console.log(`Adding ${address} to blacklist...`);
    const tx = await wallet.updateBlacklist(address, true);
    await tx.wait();
    console.log("Address added to blacklist successfully");
  }

  // Remove address from blacklist
  async function removeFromBlacklist(address: string) {
    console.log(`Removing ${address} from blacklist...`);
    const tx = await wallet.updateBlacklist(address, false);
    await tx.wait();
    console.log("Address removed from blacklist successfully");
  }

  // Check blacklist status
  async function checkBlacklistStatus(address: string) {
    const isBlacklisted = await wallet.isBlacklisted(address);
    console.log("\nBlacklist Status:");
    console.log("----------------");
    console.log(`Address: ${address}`);
    console.log(`Status: ${isBlacklisted ? "Blacklisted" : "Not Blacklisted"}`);
  }

  // Get all blacklisted addresses
  async function getAllBlacklisted() {
    // Note: This is a simplified version. In a real implementation,
    // you would need to maintain an array of blacklisted addresses
    // or use events to track blacklist changes.
    console.log("\nBlacklisted Addresses:");
    console.log("---------------------");
    console.log("Note: This feature requires maintaining a list of addresses");
    console.log("Please implement a proper tracking mechanism for production use");
  }

  // Example usage
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "add":
      await addToBlacklist(args[1]);
      break;
    case "remove":
      await removeFromBlacklist(args[1]);
      break;
    case "check":
      await checkBlacklistStatus(args[1]);
      break;
    case "list":
      await getAllBlacklisted();
      break;
    default:
      console.log("Usage:");
      console.log("  add <address>");
      console.log("  remove <address>");
      console.log("  check <address>");
      console.log("  list");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 