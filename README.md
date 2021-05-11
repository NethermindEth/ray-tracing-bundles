## Keys generation
`GenerateKeys.js` for new keys. `SearcherKeys.json` contains some already. Searcher keys can also be from this source.

## Devnet config 
Setup the Eth1 engine, beacon node, and validator. Are offline nodes during genesis time bad? If setting a coinbase from node startup, pre-compute deployed contract address if needed. 

### Prefunded accounts
In `eth1_config.json`, set `10000000000000000000000000` wei (100 million ether) for each `address` in `SearcherKeys.json` in `alloc`. Sync up with nethermind config too. 

### Pre-deployed contracts
Storage may need to be set if only using bytecode.

## MEV contract bytecode 
### In genesis
Compile source and load bytecode into `eth1_config.json` from `./aritfacts/build-info`, remember `$CONTRACT_ADDRESS`. Storage may need to be set. 

### Manual deploy
Compile, deploy and remember contract address. Remix with injected web3 has good logs but needs allow CORS from Nethermind node, if deploying with no UI or logs (through Hardhat or ethers), contract address can also be derived from deploying account. Node may display contract info in logs, so contract address can be determined that way. Could also use `ethereumjs` family of libraries. Less programmatic is to see what a Hardhat deploy returns.

## Nethermind config
Use default generated Hardhat keys and deployment. Set `$COINBASE_ADDRESS`.
```
docker run \
  --name hackaton-mev \
  -u $(id -u):$(id -g) --net host \
  -v ${PWD}/$TESTNET_NAME/public/eth1_nethermind_config.json:/networkdata/eth1_nethermind_config.json \
  -v ${PWD}/$TESTNET_NAME/nodes/nethermind0:/netherminddata \
  -itd nethermind/nethermind \
  --datadir "/netherminddata" \
  --Init.ChainSpecPath "/networkdata/eth1_nethermind_config.json" \
  --Init.WebSocketsEnabled true \
  --JsonRpc.Enabled true \
  --JsonRpc.Port 8545 \
  --JsonRpc.WebSocketsPort 8546 \
  --JsonRpc.Host 0.0.0.0 \
  --Merge.BlockAuthorAccount $COINBASE_ADDRESS
```
## Lighthouse
Make sure the bootnode tool is running. Beacon node:
```
docker run \
  --name lighthouse0bn \
  -u $(id -u):$(id -g) --net host \
  -v ${PWD}/$TESTNET_NAME/nodes/lighthouse0bn:/beacondata \
  -v ${PWD}/$TESTNET_NAME/public/eth2_config.yaml:/networkdata/eth2_config.yaml \
  -v ${PWD}/$TESTNET_NAME/public/genesis.ssz:/networkdata/genesis.ssz \
  sigp/lighthouse:rayonism \
  lighthouse \
  --datadir "/beacondata" \
  --testnet-deposit-contract-deploy-block 0 \
  --testnet-genesis-state "/networkdata/genesis.ssz" \
  --testnet-yaml-config "/networkdata/eth2_config.yaml" \
  --debug-level=debug \
  beacon_node \
  --enr-tcp-port=9000 --enr-udp-port=9000 \
  --port=9000 --discovery-port=9000 \
  --eth1-endpoints "http://localhost:8545" \
  --boot-nodes "-Jy4QI6lwQV0n8zdr3qAye3gwVmsf34IqUmYd6yOpiFZbD3RS0JRdF5QvxFULtlDNKInutUq9696lFhfghxxgb7h1dgBh2F0dG5ldHOIAAAAAAAAAACEZXRoMpD1pf1CAAAAAP__________gmlkgnY0iXNlY3AyNTZrMaEDin1VLDJs_1C3fhukDJPzs9mhiInUzG51j5SZD66Aq9I" \
  --http \
  --http-address 0.0.0.0 \
  --http-port "4000" \
  --metrics \
  --metrics-address 0.0.0.0 \
  --metrics-port "8000" \
  --listen-address 0.0.0.0
```
## Set params in `.env`
Remember to set environment variables.

## Todo
* Modify client to have variable coinbase (slightly easier than setting --data-dir to old synced data and startup new node with different coinbase address).
* Modify client block production to insert additional transactions.