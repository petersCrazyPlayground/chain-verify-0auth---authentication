const hre = require("hardhat");

async function main() {
  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const amount = process.env.AMOUNT;
  const bitcoinAddress = process.env.BITCOIN_ADDRESS;
  const lockTime = process.env.LOCK_TIME || 3600; // Default 1 hour

  if (!bridgeAddress || !tokenAddress || !amount || !bitcoinAddress) {
    throw new Error("Please set BRIDGE_ADDRESS, TOKEN_ADDRESS, AMOUNT, and BITCOIN_ADDRESS in your .env file");
  }

  console.log("Initiating bridge transfer...");
  console.log("Bridge address:", bridgeAddress);
  console.log("Token address:", tokenAddress);
  console.log("Amount:", amount);
  console.log("Bitcoin address:", bitcoinAddress);
  console.log("Lock time:", lockTime);

  const bridge = await hre.ethers.getContractAt("SKALEBitcoinBridge", bridgeAddress);
  const token = await hre.ethers.getContractAt("IERC20", tokenAddress);
  
  try {
    // Approve bridge to spend tokens
    const approveTx = await token.approve(bridgeAddress, amount);
    await approveTx.wait();
    console.log("Approval transaction successful");

    // Initiate bridge
    const bridgeTx = await bridge.initiateBridge(
      tokenAddress,
      amount,
      bitcoinAddress,
      lockTime
    );
    const receipt = await bridgeTx.wait();
    
    const event = receipt.events.find(e => e.event === "BridgeInitiated");
    console.log("Bridge initiated successfully");
    console.log("Transaction ID:", event.args[0]);
  } catch (error) {
    console.error("Failed to initiate bridge:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 