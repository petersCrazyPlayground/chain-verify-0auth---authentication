const hre = require("hardhat");

async function main() {
  const bridgeAddress = process.env.BRIDGE_ADDRESS;

  if (!bridgeAddress) {
    throw new Error("Please set BRIDGE_ADDRESS in your .env file");
  }

  console.log("Getting bridge lock times...");
  console.log("Bridge address:", bridgeAddress);

  const bridge = await hre.ethers.getContractAt("AvalancheSKALEBridge", bridgeAddress);
  
  try {
    const minLockTime = await bridge.MIN_LOCK_TIME();
    const maxLockTime = await bridge.MAX_LOCK_TIME();
    console.log("Minimum lock time:", minLockTime.toString());
    console.log("Maximum lock time:", maxLockTime.toString());
  } catch (error) {
    console.error("Failed to get lock times:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 