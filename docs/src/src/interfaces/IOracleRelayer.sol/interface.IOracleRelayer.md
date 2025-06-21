# IOracleRelayer

## Functions
### linkToken


```solidity
function linkToken() external view returns (IERC20);
```

### allowedDestinationRelayers

chain selector => relayer address >> relayers allowed to interact with this relayer


```solidity
function allowedDestinationRelayers(uint64) external returns (bytes memory);
```

### chainIdToChainSelector

chain id => chain selector


```solidity
function chainIdToChainSelector(uint256) external returns (uint64);
```

### allowedSenders

instances that are allowed to interact with this relayer


```solidity
function allowedSenders(address) external returns (bool);
```

### sendMessageWithToken


```solidity
function sendMessageWithToken(
    uint64 _destinationChainSelector,
    bytes calldata _message,
    address _token,
    uint256 _amount,
    bool _includeTokens,
    bool _payWithNative
) external returns (bytes32 messageId);
```

### sendMessage


```solidity
function sendMessage(uint64 _destinationChainSelector, bytes calldata _message, bool _payWithNative)
    external
    returns (bytes32 messageId);
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

## Events
### MessageSent

```solidity
event MessageSent(
    bytes32 indexed messageId,
    uint64 indexed destinationChainSelector,
    bytes receiver,
    bytes text,
    address token,
    uint256 amount,
    address feeToken,
    uint256 fees
);
```

### MessageReceived

```solidity
event MessageReceived(
    bytes32 indexed messageId,
    uint64 indexed sourceChainSelector,
    bytes sender,
    address token,
    uint256 amount,
    address callee,
    bytes data
);
```

### DestinationRelayerAdded

```solidity
event DestinationRelayerAdded(uint256 chainId, uint64 chainSelector, bytes relayer);
```

### DestinationRelayerRemoved

```solidity
event DestinationRelayerRemoved(uint256 chainId, uint64 chainSelector, bytes relayer);
```

### SenderAdded

```solidity
event SenderAdded(address sender);
```

### SenderRemoved

```solidity
event SenderRemoved(address sender);
```

