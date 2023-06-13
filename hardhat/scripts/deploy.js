const {ethers} = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main(){
  const redTokenContract = await ethers.getContractFactory("RedToken");
  const deployedRedTokenContract = await redTokenContract.deploy();
  await deployedRedTokenContract.deployed();
  console.log("RED TOKEN ADDRESS", deployedRedTokenContract.address);

  const stakingContract = await ethers.getContractFactory("Staking");
  const deployedStakingContract = await stakingContract.deploy("0xecd0Eba51Fb95e8BE42eEE3489C157Ea91ed5965");
  await deployedStakingContract.deployed();
  console.log("STAKING CONTRACT ADDRESS", deployedStakingContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
