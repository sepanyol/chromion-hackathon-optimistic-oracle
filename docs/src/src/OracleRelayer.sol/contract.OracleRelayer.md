# OracleRelayer
**Inherits:**
CCIPReceiver, Ownable, [IOracleRelayer](/src/interfaces/IOracleRelayer.sol/interface.IOracleRelayer.md)

Relayer that sends interchain messages from and to whitelisted corresponding relayers

Needs to know the corresponding relayers on desired chains based on chain id


## State Variables
### linkToken

```solidity
IERC20 public immutable linkToken;
```


### chainIdToChainSelector

```solidity
mapping(uint256 => uint64) public chainIdToChainSelector;
```


### allowedDestinationRelayers
chain selector => relayer address >> relayers allowed to interact with this relayer


```solidity
mapping(uint64 => bytes) public allowedDestinationRelayers;
```


### allowedSenders
instances that are allowed to interact with this relayer


```solidity
mapping(address => bool) public allowedSenders;
```


## Functions
### onlyAllowedSender


```solidity
modifier onlyAllowedSender();
```

### constructor


```solidity
constructor(address _linkToken, address _router) CCIPReceiver(_router) Ownable(msg.sender);
```

### addDestinationRelayer


```solidity
function addDestinationRelayer(uint256 _chainId, uint64 _chainSelector, address _relayer) external onlyOwner;
```

### removeDestinationRelayer


```solidity
function removeDestinationRelayer(uint256 _chainId) external onlyOwner;
```

### addSenders


```solidity
function addSenders(address _sender) external onlyOwner;
```

### removeSender


```solidity
function removeSender(address _sender) external onlyOwner;
```

### ccipReceive


```solidity
function ccipReceive(Client.Any2EVMMessage calldata message) external override;
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
) external onlyAllowedSender returns (bytes32 messageId);
```

### sendMessage


```solidity
function sendMessage(uint64 _destinationChainSelector, bytes calldata _message, bool _payWithNative)
    external
    onlyAllowedSender
    returns (bytes32 messageId);
```

### _sendMessageWithToken

internal functions


```solidity
function _sendMessageWithToken(
    uint64 _destinationChainSelector,
    bytes memory _receiver,
    bytes calldata _message,
    address _token,
    uint256 _amount,
    bool _includeTokens,
    bool _payWithNative
) internal returns (bytes32 messageId);
```

### _ccipReceive


```solidity
function _ccipReceive(Client.Any2EVMMessage memory message) internal override;
```

### recoverAsset


```solidity
function recoverAsset(address _asset) external onlyOwner;
```

### receive


```solidity
receive() external payable;
```

