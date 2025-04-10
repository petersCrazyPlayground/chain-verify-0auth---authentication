import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Wallet = await ethers.getContractFactory("MultiChainWallet");
  const wallet = await Wallet.deploy();
  
  await wallet.waitForDeployment();
  const walletAddress = await wallet.getAddress();
  console.log("Wallet deployed to:", walletAddress);

  // Initialize with default chain parameters
  const defaultChains = [
    {
      name: "ethereum",
      bridge: "0x0000000000000000000000000000000000000000", // Replace with actual bridge address
      minDeposit: ethers.parseUnits("0.1", 18),
      maxDeposit: ethers.parseUnits("1000", 18),
      dailyLimit: ethers.parseUnits("10000", 18)
    },
    {
      name: "avalanche",
      bridge: "0x0000000000000000000000000000000000000000", // Replace with actual bridge address
      minDeposit: ethers.parseUnits("0.1", 18),
      maxDeposit: ethers.parseUnits("1000", 18),
      dailyLimit: ethers.parseUnits("10000", 18)
    }
  ];

  // Add supported chains
  for (const chain of defaultChains) {
    console.log(`Adding chain ${chain.name}...`);
    const tx = await wallet.addChain(
      chain.name,
      chain.bridge,
      chain.minDeposit,
      chain.maxDeposit,
      chain.dailyLimit
    );
    await tx.wait();
    console.log(`Chain ${chain.name} added successfully`);
  }

  // Print deployment summary
  console.log("\nDeployment Summary:");
  console.log("------------------");
  console.log("Wallet Address:", walletAddress);
  console.log("Deployer Address:", deployer.address);
  console.log("\nSupported Chains:");
  for (const chain of defaultChains) {
    const info = await wallet.supportedChains(chain.name);
    console.log(`\nChain: ${chain.name}`);
    console.log(`- Bridge: ${info.bridge}`);
    console.log(`- Min Deposit: ${ethers.formatUnits(info.minDeposit, 18)}`);
    console.log(`- Max Deposit: ${ethers.formatUnits(info.maxDeposit, 18)}`);
    console.log(`- Daily Limit: ${ethers.formatUnits(info.dailyLimit, 18)}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 