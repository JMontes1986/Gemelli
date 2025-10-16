// apps/chain/hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../../.env" });

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Hardhat local network
    hardhat: {
      chainId: 31337,
    },

    // Polygon Amoy Testnet
    amoy: {
      url: process.env.WEB3_RPC_URL || "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: [PRIVATE_KEY],
      gasPrice: 35000000000, // 35 gwei
    },

    // Polygon Mainnet (para producción)
    polygon: {
      url: "https://polygon-rpc.com",
      chainId: 137,
      accounts: [PRIVATE_KEY],
      gasPrice: 200000000000, // 200 gwei
    },

    // Mumbai Testnet (deprecated pero por si acaso)
    mumbai: {