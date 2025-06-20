## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Test Smart Contracts

```shell
$ forge test
```

### View Coverage

```shell
$ npm run coverage
```

## Oracle Contracts

Requirements

- create key store account ORACLE_DEPLOYER
- this wallet needs gas tokens to work
- if you want to perform on a local fork, you should use `anvil -f avalancheFuji` for this

### Deploy

```shell
# Deploy on local fork
$ forge script ./script/DeployTestnet.s.sol:DeployTestnet --fork-url http://127.0.0.1:8545 --account ORACLE_DEPLOYER --broadcast
# Deploy on testnets
$ forge script ./script/DeployTestnet.s.sol:DeployTestnet --account ORACLE_DEPLOYER --broadcast
# Deploy on mainnet
# $ forge script ./script/DeployMainnet.s.sol:DeployMainnet --account ORACLE_DEPLOYER --broadcast
```

### Setup Fixtures

```shell
# local fork
$ forge script script/SetupFixturesOracleChain.s.sol:SetupFixturesOracleChain --fork-url http://127.0.0.1:8545 --account ORACLE_DEPLOYER --broadcast
# testnet
$ forge script script/SetupFixturesOracleChain.s.sol:SetupFixturesOracleChain --account ORACLE_DEPLOYER --broadcast

```

## Subgraph

```shell
$ graph deploy --ipfs https://ipfs.network.thegraph.com demo-oracle
```

## AI Scoring Feature

```shell
$ cd ai-scorer
```

### Start ai scoring checker

One time:

```shell
$ npm run execute
```

Loop time:

```shell
$ npm run execute-loop
```
