import { ethers } from "hardhat";
import { MultiChainWallet } from "../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();
  const walletAddress = process.env.WALLET_ADDRESS;
  
  if (!walletAddress) {
    throw new Error("WALLET_ADDRESS environment variable is not set");
  }

  const wallet = await ethers.getContractAt("MultiChainWallet", walletAddress) as MultiChainWallet;

  // Set admin role
  async function setAdmin(address: string, isAdmin: boolean) {
    console.log(`${isAdmin ? "Granting" : "Revoking"} admin role for ${address}...`);
    const tx = await wallet.setAdmin(address, isAdmin);
    await tx.wait();
    console.log(`Admin role ${isAdmin ? "granted" : "revoked"} successfully`);
  }

  // Set operator role
  async function setOperator(address: string, isOperator: boolean) {
    console.log(`${isOperator ? "Granting" : "Revoking"} operator role for ${address}...`);
    const tx = await wallet.setOperator(address, isOperator);
    await tx.wait();
    console.log(`Operator role ${isOperator ? "granted" : "revoked"} successfully`);
  }

  // Get role status
  async function getRoleStatus(address: string) {
    const isAdmin = await wallet.isAdmin(address);
    const isOperator = await wallet.isOperator(address);
    
    console.log("\nRole Status:");
    console.log("------------");
    console.log(`Address: ${address}`);
    console.log(`Admin: ${isAdmin ? "Yes" : "No"}`);
    console.log(`Operator: ${isOperator ? "Yes" : "No"}`);
    
    if (isAdmin || isOperator) {
      console.log("\nPermissions:");
      if (isAdmin) {
        console.log("- Can add/remove chains");
        console.log("- Can update chain limits");
        console.log("- Can pause/unpause contract");
        console.log("- Can manage operators");
      }
      if (isOperator) {
        console.log("- Can manage blacklist");
        console.log("- Can set transaction limits");
      }
    }
  }

  // List all admins and operators
  async function listRoles() {
    // Note: In a real implementation, you would want to:
    // 1. Maintain a list of addresses with roles
    // 2. Use events to track role changes
    // 3. Store role history
    
    console.log("\nRole Management:");
    console.log("---------------");
    console.log("Note: This feature requires maintaining a list of addresses");
    console.log("Please implement a proper tracking mechanism for production use");
    
    console.log("\nSuggested Implementation:");
    console.log("1. Create a RoleRegistry contract to track roles");
    console.log("2. Use events to log all role changes");
    console.log("3. Implement role history tracking");
    console.log("4. Add role expiration and renewal mechanisms");
  }

  // Example usage
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "set-admin":
      await setAdmin(args[1], args[2].toLowerCase() === "true");
      break;
    case "set-operator":
      await setOperator(args[1], args[2].toLowerCase() === "true");
      break;
    case "status":
      await getRoleStatus(args[1]);
      break;
    case "list":
      await listRoles();
      break;
    default:
      console.log("Usage:");
      console.log("  set-admin <address> <true/false>");
      console.log("  set-operator <address> <true/false>");
      console.log("  status <address>");
      console.log("  list");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 