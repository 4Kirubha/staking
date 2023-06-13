require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks:{
    sepolia:{
      url:"https://sepolia.infura.io/v3/e9cf275f1ddc4b81aa62c5aa0b11ac0f",
      accounts:["8ccca437f0e74b50ea78f4911dd42caad205e17653e040feb97a59187b3f206c"]
    },
  },
};
