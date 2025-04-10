const hre = require("hardhat");

async function main() {
  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  const transactionId = process.env.TRANSACTION_ID;

  if (!bridgeAddress || !transactionId) {
    throw new Error("Please set BRIDGE_ADDRESS and TRANSACTION_ID in your .env file");
  }

  console.log("Checking bridge transfer status...");
  console.log("Bridge address:", bridgeAddress);
  console.log("Transaction ID:", transactionId);

  const bridge = await hre.ethers.getContractAt("SKALEBitcoinBridge", bridgeAddress);
  
  try {
    const transaction = await bridge.transactions(transactionId);
    console.log("Transaction details:");
    console.log("Token:", transaction.token);
    console.log("Amount:", transaction.amount.toString());
    console.log("Bitcoin address:", transaction.bitcoinAddress);
    console.log("Completed:", transaction.completed);
    console.log("Lock time:", transaction.lockTime.toString());
  } catch (error) {
    console.error("Failed to check transaction status:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 