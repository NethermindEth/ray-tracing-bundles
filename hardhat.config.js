const { ethers, ContractFactory } = require("ethers");

require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(`${process.env.NETHERMIND_ETH1_NODE}`);
const signer = new ethers.Wallet(process.env.SIGNER_PK, provider);

task("deploy-setter", "", async() => {
    const abi2 = [
        "function set() public"
    ]
    const bytecode2 = "0x6080604052600f600055348015601457600080fd5b506075806100236000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063b8e010de14602d575b600080fd5b60336035565b005b601960008190555056fea264697066735822122019380e1b6f6586a7eaa2a23ac502df8abfbcfb99891d86fec21d335fe4bde46064736f6c634300060c0033"; 
    const factory2 = new ContractFactory(abi2, bytecode2, signer);
    const setter = await factory2.deploy();
    const rec2 = await setter.deployTransaction.wait();
    console.log(`address: ${rec2.contractAddress}`);
});

task("deploy-coinbase", "", async () => {
    const abi = [
        "constructor()",
        "function pay() public"
    ];
    const bytecode = "0x608060405234801561001057600080fd5b5060c88061001f6000396000f3fe608060405260043610601f5760003560e01c80631b9265b814602a576025565b36602557005b600080fd5b348015603557600080fd5b50603c603e565b005b60004711604a57600080fd5b4173ffffffffffffffffffffffffffffffffffffffff166108fc479081150290604051600060405180830381858888f19350505050158015608f573d6000803e3d6000fd5b5056fea264697066735822122097b59c58130e1eb15189fe1fcae5cc34202ea1866db4ff57fe4871083b41751864736f6c634300060c0033";
    const factory = new ContractFactory(abi, bytecode, signer);
    const coinbase = await factory.deploy();
    // console.log("deploying:", coinbase.deployTransaction);
    let rec = await coinbase.deployTransaction.wait();
    console.log(`address: ${rec.contractAddress}`);
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: "0.6.12",
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
            accounts: [`0x7074988e20b9aa7c58ea6dd5a56aaf5faf4bedc2ea7da7b02adfc97c92b7ceb3 `]
        }
    },
    paths: {
        sources: "./contracts"
    }
};

