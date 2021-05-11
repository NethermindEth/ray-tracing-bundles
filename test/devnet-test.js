const { expect } = require("chai");
const { ethers } = require("ethers");
require('dotenv').config();
// const fs = require('fs');
// const util = require('util');
// const readFile = util.promisify(fs.readFile);

const ABIS = {
    COINBASE: [
        `function pay() public`
    ],
    LIDO: [
        `function distributeMev() external payable`
    ]
}

describe("Devnet", function() {
    // const data = await readFile("PlaintextKeys.json");
    // const keys = JSON.parse(data);
    // console.log(keys.account0.privateKey);

    const rpcProvider = new ethers.providers.JsonRpcProvider(`${process.env.NETHERMIND_ETH1_NODE}`);

    const txSigner = new ethers.Wallet(process.env.SIGNER_PK);
    
    xit("Allows transfer of ether through the bundle pool.", async function() {
        // when bundle
        const curBlockNumber = await rpcProvider.getBlockNumber();
        console.log(curBlockNumber);
        let unsignedTx1 = {
            to: "0x8601eb9dab86c79970ad4eba3d3b165f13b97ce1",
            nonce: 0,
            gasLimit: 25000,
            gasPrice: 0,
            value: ethers.utils.parseEther((10_000_000).toString()),
            chainId: Number.parseInt(process.env.CHAIN_ID)
        };

        const signedAndSerializedTx = await txSigner.signTransaction(unsignedTx1);
        await rpcProvider.send('eth_sendBundle', [[signedAndSerializedTx], curBlockNumber+1, 0, 0]);

        var receiver = await rpcProvider.getBalance("0x8601eb9dab86c79970ad4eba3d3b165f13b97ce1");
        var sender = await rpcProvider.getBalance("0x200806dd5592c5c712e4eda472e06bdd225ea163");

        expect(receiver.toNumber()).to.be.greaterThan(sender.toNumber());
    });

    it("Transfers coinbase rewards...", async function() {
        let seedTx = {
            to: ethers.constants.AddressZero,
            gasLimit: ethers.BigNumber.from(250000),
            gasPrice: ethers.BigNumber.from(100000000000000),
            value: ethers.utils.parseEther((9_000_000).toString()),
        }
        let seedTxSigned = await txSigner.signTransaction(seedTx);

        let res = await rpcProvider.send("eth_sendRawTransaction", [seedTxSigned]);
        console.log(res);

        let balance = await rpcProvider.getBalance(process.env.SIGNER);
        console.log(balance.toString());

        let receipt = await rpcProvider.getTransactionReceipt(res);
        console.log(receipt);

        let foo = await rpcProvider.getTransaction(res);
        console.log(receipt);

        process.exit();

        let curBlockNumber = await rpcProvider.getBlockNumber();
        const coinbaseContract = new ethers.Contract(ADDRS.COINBASE, ABIS.COINBASE, txSigner);
        let payTx = await coinbaseContract.populateTransaction.pay();
        payTx.gasPrice = 0;
        let payTxSigned = await txSigner.signTransaction(payTx);
        const lido = new ethers.Contract(ADDRS.LIDO, ABIS.LIDO, txSigner);

        let distributeTx = lido.populateTransaction().distributeMev({value: ethers.utils.parseEther(6_000_000).toString()});
        distributeTx.gasPrice = 0;
        let distributeTxSigned = await txSigner.signTransaction(distributeTx);

        const bundle = [payTxSigned, distributeTxSigned];
        console.log(await rpcProvider.send('eth_sendBundle', bundle, curBlockNumber+1, 0, 0));

        let eth1 = await rpcProvider.getBalance(ADDRS.ETH1_COINBASE);
        let lidoBalance = await rpcProvider.getBalance(ADDRS.LIDO);
        
        expect(eth1).to.equal(ethers.utils.parseEther(3_000_000));
        expect(lidoBalance).to.equal(ethers.utils.parseEther(6_000_000));
    });
});
