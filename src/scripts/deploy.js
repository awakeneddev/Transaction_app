// Importing the Hardhat Runtime Environment (hre)
// This provides access to Hardhat's functionalities like deployments and testing
const hre = require("hardhat");

async function main() {
  // 1. Retrieve the contract factory for "Transactions"
  // This is the abstraction to deploy and interact with the "Transactions" contract
  const Transactions = await hre.ethers.getContractFactory("Transactions");

  // 2. Deploy the "Transactions" contract
  // The deploy method sends a deployment transaction to the blockchain
  const transactions = await Transactions.deploy();

  // 3. Wait for the deployment to be mined
  // This ensures the deployment transaction is fully completed
  await transactions.waitForDeployment();

  // 4. Log the address of the deployed contract to the console
  // Replace 'transaction' with 'transactions' to fix the typo
  console.log("Transactions deployed to:", transactions.target);
 
}

// 5. Handle errors during the deployment process
// Logs the error and exits the process with a failure code
main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
