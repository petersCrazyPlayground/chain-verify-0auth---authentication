import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Wallet = await ethers.getContractFactory("MultiChainWallet");
  const wallet = await Wallet.deploy();
  
  await wallet.waitForDeployment();
  console.log("Wallet deployed to:", await wallet.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 