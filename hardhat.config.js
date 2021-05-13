const { ethers, ContractFactory } = require("ethers");

require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.6.12"
            },
            {
                version: "0.4.24"
            },
            {
                version: "0.8.0"
            },
            {
                version: "0.8.4"
            }
        ]
    },
    // --network localhost for hardhat node
    networks: {
        localhost_hardhat: {
            url: `http://localhost:8545`,
        },
        localhost_nethermind: {
            url: `http://localhost:8545`,
            chainId: 700
        },
        nethermind: {
            url: `${process.env.NETHERMIND_ETH1_NODE}`,
            accounts: [`0x7074988e20b9aa7c58ea6dd5a56aaf5faf4bedc2ea7da7b02adfc97c92b7ceb3`]
        }
    },
    paths: {
        // sources: "./contracts"
        sources: "./rayonism-mev-hackathon/contracts"
    }
};

