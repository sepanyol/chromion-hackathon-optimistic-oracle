# RequestFactory
**Inherits:**
[IRequestFactory](/src/interfaces/IRequestFactory.sol/interface.IRequestFactory.md)

Factory contract to deploy request contracts on either the OracleChain or the RequesterChain.

*Uses OpenZeppelin Clones to deploy lightweight proxies.*


## State Variables
### implementation
Implementation address used for cloning.


```solidity
address public immutable implementation;
```


### paymentAsset
ERC20 token used for reward payment.


```solidity
address public immutable paymentAsset;
```


### oracleOrRelayer
Address of the oracle coordinator or relayer, depending on the chain.


```solidity
address public immutable oracleOrRelayer;
```


### homeFactory
Address of the factory on the home chain


```solidity
address public immutable homeFactory;
```


### homeChainId
Chain id of the home chain


```solidity
uint256 public immutable homeChainId;
```


### isOracleChain
Flag indicating whether this factory is deployed on the OracleChain.


```solidity
bool public immutable isOracleChain;
```


## Functions
### constructor


```solidity
constructor(
    address _paymentAsset,
    address _oracleOrRelayer,
    address _homeFactory,
    uint256 _homeChainId,
    bool _isOracleChain
);
```

### createRequest

Creates a new request contract with the provided parameters.

*Clones a minimal proxy of the request implementation and initializes it.
Transfers the reward amount from the sender to the factory.*


```solidity
function createRequest(RequestTypes.RequestParams memory p) external returns (address clone);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`p`|`RequestTypes.RequestParams`|The struct containing all request parameters.|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`clone`|`address`|The address of the newly deployed request contract.|


## Events
### RequestCreated
Emitted when a request contract is created.


```solidity
event RequestCreated(address indexed requestContract, RequestTypes.RequestParams requestParams);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`requestContract`|`address`|The deployed request contract address.|
|`requestParams`|`RequestTypes.RequestParams`|The parameters used for request initialization.|

