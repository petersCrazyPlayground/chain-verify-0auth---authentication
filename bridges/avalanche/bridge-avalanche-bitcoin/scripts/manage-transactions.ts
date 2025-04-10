import { ethers } from "hardhat";
import { AvalancheBitcoinBridge } from "../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Managing transactions with account:", signer.address);

  const bridgeAddress = process.env.BRIDGE_ADDRESS;
  if (!bridgeAddress) {
    throw new Error("BRIDGE_ADDRESS environment variable is not set");
  }

  const bridge = await ethers.getContractAt("AvalancheBitcoinBridge", bridgeAddress) as AvalancheBitcoinBridge;

  const action = process.argv[2];
  const transactionId = process.argv[3];

  switch (action) {
    case "initiate":
      const tokenAddress = process.argv[3];
      const amount = ethers.parseUnits(process.argv[4] || "100", 6);
      const bitcoinAddress = process.argv[5];

      if (!bitcoinAddress) {
        throw new Error("Bitcoin address is required");
      }

      console.log("Initiating transfer...");
      const transferTx = await bridge.transferToBitcoin(
        tokenAddress,
        amount,
        bitcoinAddress
      );
      await transferTx.wait();
      console.log("Transfer initiated successfully");
      break;

    case "complete":
      console.log("Completing transaction...");
      const completeTx = await bridge.completeBridge(transactionId);
      await completeTx.wait();
      console.log("Transaction completed successfully");
      break;

    case "fail":
      const reason = process.argv[4] || "Transaction failed";
      console.log("Failing transaction...");
      const failTx = await bridge.failBridge(transactionId, reason);
      await failTx.wait();
      console.log("Transaction marked as failed");
      break;

    case "info":
      const transaction = await bridge.transactions(transactionId);
      if (transaction.sender === ethers.ZeroAddress) {
        console.log("Transaction not found");
        process.exit(1);
      }

      console.log("\nTransaction Information:");
      console.log("----------------------");
      console.log("Sender:", transaction.sender);
      console.log("Token:", transaction.token);
      console.log("Amount:", ethers.formatUnits(transaction.amount, 6));
      console.log("Bitcoin Address:", transaction.bitcoinAddress);
      console.log("Timestamp:", new Date(transaction.timestamp * 1000).toISOString());
      console.log("Nonce:", transaction.nonce);
      console.log("Completed:", transaction.completed);
      break;

    default:
      console.log("Usage: npm run manage-transactions <action> [params]");
      console.log("Actions:");
      console.log("  initiate <token-address> <amount> <bitcoin-address>");
      console.log("  complete <transaction-id>");
      console.log("  fail <transaction-id> [reason]");
      console.log("  info <transaction-id>");
      process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 