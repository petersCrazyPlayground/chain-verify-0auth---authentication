const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const AvalancheSKALEBridge = await hre.ethers.getContractFactory("AvalancheSKALEBridge");
  const bridge = await AvalancheSKALEBridge.deploy();
  await bridge.waitForDeployment();

  console.log("Bridge deployed to:", await bridge.getAddress());

  // Wait for 5 block confirmations
  await bridge.deploymentTransaction().wait(5);

  // Verify the contract
  if (hre.network.name !== "hardhat") {
    try {
      await hre.run("verify:verify", {
        address: await bridge.getAddress(),
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.error("Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 