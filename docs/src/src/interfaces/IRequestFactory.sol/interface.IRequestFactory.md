# IRequestFactory

## Functions
### implementation

Implementation address used for cloning.


```solidity
function implementation() external returns (address);
```

### paymentAsset

ERC20 token used for reward payment.


```solidity
function paymentAsset() external returns (address);
```

### oracleOrRelayer

Address of the oracle coordinator or relayer, depending on the chain.


```solidity
function oracleOrRelayer() external returns (address);
```

### homeFactory

Address of the factory on the home chain


```solidity
function homeFactory() external returns (address);
```

### homeChainId

Chain id of the home chain


```solidity
function homeChainId() external returns (uint256);
```

### isOracleChain

Flag indicating whether this factory is deployed on the OracleChain.


```solidity
function isOracleChain() external returns (bool);
```

### createRequest

Creates a new request contract with the provided parameters.

*Clones a minimal proxy of the request implementation and initializes it.
Transfers the reward amount from the sender to the factory.*


```solidity
function createRequest(RequestTypes.RequestParams memory p) external returns (address);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`p`|`RequestTypes.RequestParams`|The struct containing all request parameters.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`address`|clone The address of the newly deployed request contract.|


