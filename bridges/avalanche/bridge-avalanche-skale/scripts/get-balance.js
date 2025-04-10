const hre = require("hardhat");

async function main() {
  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  const tokenAddress = process.env.TOKEN_ADDRESS;

  if (!bridgeAddress || !tokenAddress) {
    throw new Error("Please set BRIDGE_ADDRESS and TOKEN_ADDRESS in your .env file");
  }

  console.log("Getting token balance in bridge...");
  console.log("Bridge address:", bridgeAddress);
  console.log("Token address:", tokenAddress);

  const bridge = await hre.ethers.getContractAt("AvalancheSKALEBridge", bridgeAddress);
  const token = await hre.ethers.getContractAt("IERC20", tokenAddress);
  
  try {
    const balance = await token.balanceOf(bridgeAddress);
    console.log("Token balance:", balance.toString());
  } catch (error) {
    console.error("Failed to get token balance:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 