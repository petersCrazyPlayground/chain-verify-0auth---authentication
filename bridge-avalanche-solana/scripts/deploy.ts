import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Bridge = await ethers.getContractFactory("AvalancheSolanaBridge");
  const bridge = await Bridge.deploy();
  
  await bridge.waitForDeployment();
  console.log("Bridge deployed to:", await bridge.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 