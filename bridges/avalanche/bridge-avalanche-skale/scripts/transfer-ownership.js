const hre = require("hardhat");

async function main() {
  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  const newOwner = process.env.NEW_OWNER;

  if (!bridgeAddress || !newOwner) {
    throw new Error("Please set BRIDGE_ADDRESS and NEW_OWNER in your .env file");
  }

  console.log("Transferring bridge ownership...");
  console.log("Bridge address:", bridgeAddress);
  console.log("New owner:", newOwner);

  const bridge = await hre.ethers.getContractAt("AvalancheSKALEBridge", bridgeAddress);
  
  try {
    const tx = await bridge.transferOwnership(newOwner);
    await tx.wait();
    console.log("Ownership transferred successfully");
  } catch (error) {
    console.error("Failed to transfer ownership:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 