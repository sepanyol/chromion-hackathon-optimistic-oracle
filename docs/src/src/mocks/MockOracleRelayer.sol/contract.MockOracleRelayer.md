# MockOracleRelayer
**Inherits:**
[IOracleRelayer](/src/interfaces/IOracleRelayer.sol/interface.IOracleRelayer.md)

Stub for simulating relayer calls in cross-chain testing


## Functions
### linkToken


```solidity
function linkToken() external pure returns (IERC20);
```

### allowedDestinationRelayers


```solidity
function allowedDestinationRelayers(uint64) external returns (bytes memory);
```

### chainIdToChainSelector


```solidity
function chainIdToChainSelector(uint256) external returns (uint64);
```

### allowedSenders

instances that are allowed to interact with this relayer


```solidity
function allowedSenders(address) external returns (bool);
```

### addDestinationRelayer


```solidity
function addDestinationRelayer(uint256 _chainId, uint64 _chainSelector, address _relayer) external;
```

### removeDestinationRelayer


```solidity
function removeDestinationRelayer(uint256 _chainId) external;
```

### addSenders


```solidity
function addSenders(address _sender) external;
```

### removeSender


```solidity
function removeSender(address _sender) external;
```

### recoverAsset


```solidity
function recoverAsset(address _asset) external;
```

### sendMessageWithToken


```solidity
function sendMessageWithToken(uint64, bytes calldata, address, uint256, bool, bool)
    external
    returns (bytes32 messageId);
```

### sendMessage


```solidity
function sendMessage(uint64, bytes calldata, bool) external returns (bytes32 messageId);
```

## Events
### event_sendMessageWithToken

```solidity
event event_sendMessageWithToken();
```

### event_sendMessage

```solidity
event event_sendMessage();
```

