## Usage
`npm install`, then `npx hardhat test`. 

## Keys generation
`GenerateKeys.js` for new keys. `SearcherKeys.json` contains some already. Searcher keys can also be from this source.

## Devnet config 
Setup the Eth1 engine, beacon node, and validator. Are offline nodes during genesis time bad? If setting a coinbase from node startup, pre-compute deployed contract address if needed. 

### Prefunded accounts
In `eth1_config.json`, set `10000000000000000000000000` wei (100 million ether) for each `address` in `SearcherKeys.json` in `alloc`. Sync up with nethermind config too. 

### Pre-deployed contracts
Storage may need to be set if only using bytecode.

## If using MEV contract bytecode (deprecated?)
### In genesis
Compile source and load bytecode into `eth1_config.json` from `./aritfacts/build-info`, remember `$CONTRACT_ADDRESS`. Storage may need to be set. 
### Manual deploy
Compile, deploy and remember contract address. Remix with injected web3 has good logs but needs allow CORS from Nethermind node, if deploying with no UI or logs (through Hardhat or ethers), contract address can also be derived from deploying account. Node may display contract info in logs, so contract address can be determined that way. Could also use `ethereumjs` family of libraries. Less programmatic is to see what a Hardhat deploy returns.
## Nethermind config
Use default generated Hardhat keys and deployment. Set `$COINBASE_ADDRESS`. Remember to enable MEV plugin and JSON RPC.
## Lighthouse beacon node
Make sure the bootnode tool is running.
## Set params in `.env`
Remember to set environment variables.
## Todo
* Modify client to have variable coinbase (slightly easier than setting --data-dir to old synced data and startup new node with different coinbase address).
* Modify client block production to insert additional transactions.