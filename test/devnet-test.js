const { expect, assert } = require("chai");
const { ethers } = require("ethers");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
require('dotenv').config();
// const fs = require('fs');
// const util = require('util');
// const readFile = util.promisify(fs.readFile);

const rpcProvider = new ethers.providers.JsonRpcProvider(`${process.env.NETHERMIND_ETH1_NODE}`);
const txSigner = new ethers.Wallet(process.env.SIGNER_PK, rpcProvider);

const ABIS = {}

const ADDRS = {}

async function deploy(contract) {
    switch(contract) {
        case "Setter":
            const abi2 = [
                "function set() public"
            ]
            const bytecode2 = "0x6080604052600f600055348015601457600080fd5b506075806100236000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063b8e010de14602d575b600080fd5b60336035565b005b601960008190555056fea264697066735822122019380e1b6f6586a7eaa2a23ac502df8abfbcfb99891d86fec21d335fe4bde46064736f6c634300060c0033"; 
            const factory2 = new ethers.ContractFactory(abi2, bytecode2, txSigner);
            const setter = await factory2.deploy();
            const rec2 = await setter.deployTransaction.wait();
            return rec2.contractAddress;
        case "Coinbase":
            const abi = [
                "constructor()",
                "function pay() public"
            ];
            const bytecode = "0x608060405234801561001057600080fd5b5060c88061001f6000396000f3fe608060405260043610601f5760003560e01c80631b9265b814602a576025565b36602557005b600080fd5b348015603557600080fd5b50603c603e565b005b60004711604a57600080fd5b4173ffffffffffffffffffffffffffffffffffffffff166108fc479081150290604051600060405180830381858888f19350505050158015608f573d6000803e3d6000fd5b5056fea264697066735822122097b59c58130e1eb15189fe1fcae5cc34202ea1866db4ff57fe4871083b41751864736f6c634300060c0033";
            const factory = new ethers.ContractFactory(abi, bytecode, txSigner);
            const coinbase = await factory.deploy();
            // console.log("deploying:", coinbase.deployTransaction);
            let rec = await coinbase.deployTransaction.wait();
            return rec.contractAddress;
    }
}

// TODO use a loopy contract too?
async function genSignedTx(n) {
    let signedtx = [];
    let startingNonce = await txSigner.getTransactionCount();
    for(var i=0; i < n; i++) {
        let tx = {
            to: ethers.constants.AddressZero,
            gasPrice: ethers.BigNumber.from(1),
            nonce: startingNonce+i,
            value: ethers.BigNumber.from("1")
        }
        let populatedTx = await txSigner.populateTransaction(tx);
        let signed = await txSigner.signTransaction(populatedTx);
        signedtx.push(signed);
    }
    return signedtx;
}

function sleep(time) {
    return new Promise(r => setTimeout(r, time));
}

describe("Devnet", function() {
    this.timeout(200000);

    it("eth_sendBundle accepts a bundle", async function() {
        let curBlockNumber = await rpcProvider.getBlockNumber();
        let tx = {
            to: ethers.constants.AddressZero,
            value: ethers.utils.parseEther("1")
        }
        let signedTx = await txSigner.signTransaction(tx);
        let bundle = [signedTx];
        expect(await rpcProvider.send('eth_sendBundle', [bundle, curBlockNumber+1,0,0])).to.be.equal(true);
    });

    // const data = await readFile("PlaintextKeys.json");
    // const keys = JSON.parse(data);
    // console.log(keys.account0.privateKey);
    it("Allows simple transfer of ether through the bundle pool", async function() {
        let before = await txSigner.getBalance();
        let curBlockNumber = await rpcProvider.getBlockNumber();
        let tx = {
            to: ethers.utils.AddressZero,
            gasPrice: ethers.BigNumber.from(100000),
            value: ethers.utils.parseEther("10000"),
        };
        let populatedTx = await txSigner.populateTransaction(tx);
        let signedTx = await txSigner.signTransaction(populatedTx);
        await rpcProvider.send('eth_sendBundle', [[signedTx], curBlockNumber+1, 0, 0]);

        await new Promise(r => setTimeout(r, 12000));

        let after = await txSigner.getBalance();
        expect(before).to.not.be.equal(after);
    });

    it("Transfers coinbase rewards to coinbase and Lido", async function() {
        async function logLidoBalances(time) {
            console.log(`balances at ${time}: ?`);
        }
        
        let address = await deploy("Coinbase");
        let tx = {
            to: address,
            value: ethers.utils.parseEther("1000"),
        }
        let populated = await txSigner.populateTransaction(tx);
        let signed = await txSigner.signTransaction(populated);
        let txHash = await rpcProvider.send("eth_sendRawTransaction", [signed]);
        await sleep(12000);
        // console.log(txHash);
        // let receipt = await rpcProvider.getTransactionReceipt(txHash);
        // console.log(receipt);
        let balance = await rpcProvider.getBalance(address);
        expect(balance).to.be.equal(ethers.utils.parseEther("1000"));

        await logLidoBalances("before");

        let curBlockNumber = await rpcProvider.getBlockNumber();
        // const coinbaseContract = new ethers.Contract(address, ABIS.COINBASE, txSigner);
        // let populatedPay = await coinbaseContract.populateTransaction.pay();
        // let signedPay = await txSigner.signTransaction(populatedPay);
        let tx2 = {
            to: address,
            data: "0x1b9265b8"
        }
        let populated2 = await txSigner.populateTransaction(tx2);
        let signed2 = await txSigner.signTransaction(populated2);

        // TODO this should be added and signed by the eth1 engine and taken from its reward
        console.log("set LIDO contract address in .env then remove process.exit()");
        process.exit();
        console.log("assuming function is typo distribureMev");
        let tx3 = {
            to: process.env.LIDO_ADDRESS_FROM_LAST_DEPLOY,
            data: "0x3c45a3d2", // TODO assuming its called distribureMev
            value: ethers.utils.parseEther("2000")
        }
        let populated3 = await txSigner.populateTransaction(tx3);
        let signed3 = await txSigner.signTransaction(populated3);

        await rpcProvider.send("eth_sendBundle", [[signed2, signed3],curBlockNumber+1,0,0]);
        await sleep(12000);

        let newBalance = await rpcProvider.getBalance(address);
        expect(newBalance.toString()).to.be.equal("0");

        await logLidoBalances("after");
    });

    xit("Bundle tx push out regular tx", async function() {
        // let block = await rpcProvider.getBlock();
        // console.log(block.gasLimit.toString());
        // process.exit();

        // let date = new Date();
        // let a = date.getTime();
        // await genSignedTx(1000);
        // console.log(date.getTime() - a);
        // process.exit();

        let address = deploy("Setter");
        let bundle = await genSignedTx(1000);
        let curBlockNumber = await rpcProvider.getBlockNumber();
        // network cant send this much data 
        assert(await rpcProvider.send('eth_sendBundle', [bundle, curBlockNumber+1,0,0]));

        // TODO even if tx is pushed out for cur block it will still get picked up in the next blocks
        let tx = {
            to: address,
            data: "0xb8e010de"
        }
        let populated = txSigner.populateTransaction(tx);
        let signed = txSigner.signTransaction(populated);
        await rpcProvider.send('eth_sendRawTransaction', [signed]);

        await new Promise(r => setTimeout(r, 12000));
        // TODO check that the setter value stayed the same
        assert(false);
    });
});
