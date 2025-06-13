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

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

### View Coverage

```shell
$ npm run coverage
```

### Deployment on localfork

Requirements

* create key store account ORACLE_DEPLOYER
* this wallet needs gas tokens to work

#### Start up oracle chain

```shell
$ anvil -f avalancheFuji
```

#### Deploy contracts

```shell
$ forge script script/Deploy.s.sol:Deploy --fork-url http://127.0.0.1:8545 --account ORACLE_DEPLOYER --broadcast
```

#### Setup fixtures oracle chain

```shell
$ forge script script/SetupFixturesOracleChain.s.sol:SetupFixturesOracleChain --fork-url http://127.0.0.1:8545 --account ORACLE_DEPLOYER --broadcast
```
