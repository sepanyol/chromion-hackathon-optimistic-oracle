# Chromion Optimistic Oracle

A modular and extensible optimistic oracle system built for cross-chain Real World Asset (RWA) resolution. This oracle allows trust-minimized data submission, dispute resolution, and reward distribution using a challenge-based process with a focus on decentralization and verifiability.

## ❓ Problem & 💡 Solution

### The Problem

On-chain protocols increasingly depend on **off-chain facts** – such as whether a real-world asset exists, whether a borrower defaulted, or whether a shipment arrived. Verifying such claims is difficult, especially when:

- Data exists **off-chain** or across **multiple chains**
- Trusted third parties introduce **centralization risks**
- Existing oracles aren't designed for **binary truth resolution**
- There’s no incentive-aligned framework for **dispute and escalation**

Moreover, **Real World Assets (RWAs)** bring massive value on-chain, but lack a general-purpose system for **decentralized truth arbitration** tied to those assets.

---

### Our Solution

This protocol introduces an **Optimistic Oracle for Arbitrary Claims**, which allows anyone to request a truth assertion and resolve it through a transparent, incentive-aligned process:

- 🔁 **Cross-chain requests** with full support for **multi-chain deployment**
- 🔍 **Optimistic answering** – answers are accepted unless challenged
- ⚖️ **Dispute resolution** via staking-based challenges and community reviews
- 💰 **USDC-denominated bonding and rewards**, ensuring economic alignment
- 🏗️ **Modular contracts** for flexibility and upgradeability

Whether the claim is about the valuation of a real-world asset or a simple yes/no assertion about an event, this oracle brings decentralized truth to every chain – without sacrificing security or efficiency.

## 🏆 Hackathon Context

- Built for: **Chromion: A Chainlink Hackathon (2025)**
- Devfolio: https://chromion-chainlink-hackathon.devfolio.co/overview
- Team: `Equolibrium`
- Tracks:
  - DeFi
  - Cross-Chain
  - Avalanche
- Chainlink Usage:
  - ✅ CCIP
  - ✅ Automation
  - ❌ VRF for coinflipping challenge + review draws
  - ❌ Functions for AI Scoring (planned)

## 🌐 Project Structure

This repository consists of the following key components:

### `src/`

Smart contracts implementing the core logic:

- `BaseRequestContract`: Abstract request interface used for various request types (RWA valuation, boolean questions).
- `RequestFactory`: Creates request contracts using minimal proxies for gas efficiency.
- `OracleCoordinator`: Handles proposal submission, challenges, reviews, and finalization.
- `RequestScoringRegistry`: Stores all AI generated scorings related to creates requests

### `graph/`

Subgraph configuration (The Graph Protocol) to index on-chain data:

- `schema.graphql`: GraphQL schema for events and request metadata.
- `subgraph.yaml`: Configuration file for event handlers.
- `mappings/`: Contains event mappings and handler logic in AssemblyScript.

### `ai-scorer/`

AI-based scoring service for request validation and consistency

- Uses OpenAI to evaluate question and context information
- It creates a context-aware scoring and stores it on-chain

---

## 🧱 Smart Contract Workflow Overview

```mermaid
sequenceDiagram
    participant Requester
    participant Factory
    participant OracleRelayer
    participant OracleChain
    participant OracleCoordinator
    participant Reviewer
    participant Automation

    Requester->>Factory: createRequest(...)
    Factory->>OracleRelayer: forwardToOracle(payload)
    OracleRelayer->>OracleChain: deploy + initialize RequestContract
    OracleChain->>OracleCoordinator: registerRequest()

    Note right of OracleCoordinator: Status = Pending → Open

    Requester-->>Requester: Wait for Open status
```

---

## 🧠 &nbsp; Core Concepts

### ✅ &nbsp; Optimistic Resolution

- Proposers submit answers with a 100 USDC bond.
- Anyone can challenge an answer with a 100 USDC bond.
- Reviewers can vote (5 USDC bond) on a challenge’s validity.
- Finalization occurs automatically (via Chainlink Automation) or via multisig as fallback.

### 📊 &nbsp; Real World Assets

Use case: Tokenized RWA like gold, real estate, or carbon credits.

RWA requests contain:

- ERC-1155 asset address
- Contextual string data (question, context, truthMeaning)
- Target value in USDC

### 🏛️ &nbsp; Request Lifecycle States

```text
Pending → Open → Proposed → Challenged → Resolved
```

---

## ⚖️ &nbsp; Roles and Access

| Role              | Responsibility                     |
| ----------------- | ---------------------------------- |
| Factory           | Request creation and forwarding    |
| OracleCoordinator | Proposal management and resolution |
| RequestStore      | Status + metadata registry         |
| RewardHandler     | Handles bond/reward distribution   |
| FINALIZER_ROLE    | Finalize eligible requests         |
| Automation        | Time-based auto-finalization       |

---

## 🚀 &nbsp; Getting Started

```bash
forge install
forge build
```

### Test

#### Ignore Integration Testing

```shell
forge test --no-match-contract "CrossChainIntegrationTest|OracleRelayerTest"
```

#### full cycle testing on fork (+Integration)

For itegration testing, you have to have configured 2 RPCs in your .env file. Visit https://chainlist.org/ to get a public RPC

```shell
# .env
AVALANCHE_FUJI_RPC_URL=
ETHEREUM_SEPOLIA_RPC_URL=
```

Then you can execute

```shell
forge test
```

### Deploy

Requirements

- create key store account ORACLE_DEPLOYER
- this wallet needs gas tokens to work
- if you want to perform on a local fork, you should use `anvil -f avalancheFuji` for this

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
$ graph codegen
$ graph deploy --ipfs https://ipfs.network.thegraph.com demo-oracle
```

## AI Scorer

### Introduction

Uses ChatGPT for checking wether a oracle request is most likely to get challenged or not. It uses the prompt defined in [ai-scorer/src/utils/prompts.ts](ai-scorer/src/utils/prompts.ts) in order to generate an expected scoring pattern.

### Run AI Scorer (locally)

```shell
$ cd ai-scorer

# you can run it just once
$ npm run execute

# or every 30 seconds
$ npm run execute-loop
```


