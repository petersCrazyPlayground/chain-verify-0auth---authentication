import { ethers } from "hardhat";
import { MultiChainWallet } from "../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();
  const walletAddress = process.env.WALLET_ADDRESS;
  
  if (!walletAddress) {
    throw new Error("WALLET_ADDRESS environment variable is not set");
  }

  const wallet = await ethers.getContractAt("MultiChainWallet", walletAddress) as MultiChainWallet;

  // Chain Management
  async function addChain(chain: string, bridgeAddress: string) {
    console.log(`Adding chain ${chain} with bridge ${bridgeAddress}...`);
    const tx = await wallet.addChain(chain, bridgeAddress);
    await tx.wait();
    console.log("Chain added successfully");
  }

  async function removeChain(chain: string) {
    console.log(`Removing chain ${chain}...`);
    const tx = await wallet.removeChain(chain);
    await tx.wait();
    console.log("Chain removed successfully");
  }

  // Token Operations
  async function deposit(tokenAddress: string, chain: string, amount: string) {
    console.log(`Depositing ${amount} tokens to ${chain}...`);
    const token = await ethers.getContractAt("IERC20", tokenAddress);
    const tx = await token.approve(walletAddress, ethers.parseUnits(amount, 18));
    await tx.wait();
    
    const depositTx = await wallet.deposit(tokenAddress, chain, ethers.parseUnits(amount, 18));
    await depositTx.wait();
    console.log("Deposit successful");
  }

  async function withdraw(tokenAddress: string, chain: string, amount: string) {
    console.log(`Withdrawing ${amount} tokens from ${chain}...`);
    const tx = await wallet.withdraw(tokenAddress, chain, ethers.parseUnits(amount, 18));
    await tx.wait();
    console.log("Withdrawal successful");
  }

  async function transfer(tokenAddress: string, to: string, chain: string, amount: string) {
    console.log(`Transferring ${amount} tokens to ${to} on ${chain}...`);
    const tx = await wallet.transfer(tokenAddress, to, chain, ethers.parseUnits(amount, 18));
    await tx.wait();
    console.log("Transfer successful");
  }

  // Status and Information
  async function getChainInfo(chain: string) {
    const info = await wallet.supportedChains(chain);
    console.log("\nChain Information:");
    console.log("-----------------");
    console.log(`Chain: ${chain}`);
    console.log(`Is Supported: ${info.isSupported}`);
    console.log(`Bridge Address: ${info.bridge}`);
  }

  async function getBalance(tokenAddress: string, chain: string) {
    const balance = await wallet.balances(signer.address, chain);
    console.log("\nBalance Information:");
    console.log("------------------");
    console.log(`Chain: ${chain}`);
    console.log(`Token: ${tokenAddress}`);
    console.log(`Balance: ${ethers.formatUnits(balance, 18)}`);
  }

  // Example usage
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "add-chain":
      await addChain(args[1], args[2]);
      break;
    case "remove-chain":
      await removeChain(args[1]);
      break;
    case "deposit":
      await deposit(args[1], args[2], args[3]);
      break;
    case "withdraw":
      await withdraw(args[1], args[2], args[3]);
      break;
    case "transfer":
      await transfer(args[1], args[2], args[3], args[4]);
      break;
    case "chain-info":
      await getChainInfo(args[1]);
      break;
    case "balance":
      await getBalance(args[1], args[2]);
      break;
    default:
      console.log("Usage:");
      console.log("  add-chain <chain> <bridgeAddress>");
      console.log("  remove-chain <chain>");
      console.log("  deposit <tokenAddress> <chain> <amount>");
      console.log("  withdraw <tokenAddress> <chain> <amount>");
      console.log("  transfer <tokenAddress> <to> <chain> <amount>");
      console.log("  chain-info <chain>");
      console.log("  balance <tokenAddress> <chain>");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 