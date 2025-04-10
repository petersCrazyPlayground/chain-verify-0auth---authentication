const hre = require("hardhat");

async function main() {
  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  const tokenAddress = process.env.TOKEN_ADDRESS;

  if (!bridgeAddress || !tokenAddress) {
    throw new Error("Please set BRIDGE_ADDRESS and TOKEN_ADDRESS in your .env file");
  }

  console.log("Checking if token is supported by bridge...");
  console.log("Bridge address:", bridgeAddress);
  console.log("Token address:", tokenAddress);

  const bridge = await hre.ethers.getContractAt("AvalancheSKALEBridge", bridgeAddress);
  
  try {
    const isSupported = await bridge.supportedTokens(tokenAddress);
    console.log("Token supported:", isSupported);
  } catch (error) {
    console.error("Failed to check token support:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 