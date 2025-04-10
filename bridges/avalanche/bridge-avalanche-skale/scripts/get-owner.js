const hre = require("hardhat");

async function main() {
  const bridgeAddress = process.env.BRIDGE_ADDRESS;

  if (!bridgeAddress) {
    throw new Error("Please set BRIDGE_ADDRESS in your .env file");
  }

  console.log("Getting bridge owner...");
  console.log("Bridge address:", bridgeAddress);

  const bridge = await hre.ethers.getContractAt("AvalancheSKALEBridge", bridgeAddress);
  
  try {
    const owner = await bridge.owner();
    console.log("Bridge owner:", owner);
  } catch (error) {
    console.error("Failed to get bridge owner:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 