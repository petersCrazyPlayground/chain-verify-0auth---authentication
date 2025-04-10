const hre = require("hardhat");

async function main() {
  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  const startIndex = process.env.START_INDEX || 0;
  const count = process.env.COUNT || 10;

  if (!bridgeAddress) {
    throw new Error("Please set BRIDGE_ADDRESS in your .env file");
  }

  console.log("Getting bridge transaction IDs...");
  console.log("Bridge address:", bridgeAddress);
  console.log("Start index:", startIndex);
  console.log("Count:", count);

  const bridge = await hre.ethers.getContractAt("AvalancheSKALEBridge", bridgeAddress);
  
  try {
    const transactionCount = await bridge.transactionCount();
    const endIndex = Math.min(Number(startIndex) + Number(count), Number(transactionCount));
    
    console.log("Transaction IDs:");
    for (let i = Number(startIndex); i < endIndex; i++) {
      const transactionId = await bridge.transactionIds(i);
      console.log(transactionId);
    }
  } catch (error) {
    console.error("Failed to get transaction IDs:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 