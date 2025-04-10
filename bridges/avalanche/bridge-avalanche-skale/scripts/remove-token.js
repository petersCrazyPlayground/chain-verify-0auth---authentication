const hre = require("hardhat");

async function main() {
  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  const tokenAddress = process.env.TOKEN_ADDRESS;

  if (!bridgeAddress || !tokenAddress) {
    throw new Error("Please set BRIDGE_ADDRESS and TOKEN_ADDRESS in your .env file");
  }

  console.log("Removing token from bridge...");
  console.log("Bridge address:", bridgeAddress);
  console.log("Token address:", tokenAddress);

  const bridge = await hre.ethers.getContractAt("AvalancheSKALEBridge", bridgeAddress);
  
  try {
    const tx = await bridge.removeSupportedToken(tokenAddress);
    await tx.wait();
    console.log("Token removed successfully");
  } catch (error) {
    console.error("Failed to remove token:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 