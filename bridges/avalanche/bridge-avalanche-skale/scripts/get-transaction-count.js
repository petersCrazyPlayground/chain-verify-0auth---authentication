const hre = require("hardhat");

async function main() {
  const bridgeAddress = process.env.BRIDGE_ADDRESS;

  if (!bridgeAddress) {
    throw new Error("Please set BRIDGE_ADDRESS in your .env file");
  }

  console.log("Getting bridge transaction count...");
  console.log("Bridge address:", bridgeAddress);

  const bridge = await hre.ethers.getContractAt("AvalancheSKALEBridge", bridgeAddress);
  
  try {
    const transactionCount = await bridge.transactionCount();
    console.log("Transaction count:", transactionCount.toString());
  } catch (error) {
    console.error("Failed to get transaction count:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 