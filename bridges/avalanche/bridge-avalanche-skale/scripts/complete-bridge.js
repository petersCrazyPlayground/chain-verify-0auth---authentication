const hre = require("hardhat");

async function main() {
  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  const transactionId = process.env.TRANSACTION_ID;

  if (!bridgeAddress || !transactionId) {
    throw new Error("Please set BRIDGE_ADDRESS and TRANSACTION_ID in your .env file");
  }

  console.log("Completing bridge transfer...");
  console.log("Bridge address:", bridgeAddress);
  console.log("Transaction ID:", transactionId);

  const bridge = await hre.ethers.getContractAt("AvalancheSKALEBridge", bridgeAddress);
  
  try {
    const tx = await bridge.completeBridge(transactionId);
    await tx.wait();
    console.log("Bridge transfer completed successfully");
  } catch (error) {
    console.error("Failed to complete bridge transfer:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 