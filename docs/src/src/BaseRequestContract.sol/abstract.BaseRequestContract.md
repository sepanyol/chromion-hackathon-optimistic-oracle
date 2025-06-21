# BaseRequestContract
**Inherits:**
[IBaseRequestContract](/src/interfaces/IBaseRequestContract.sol/interface.IBaseRequestContract.md), Initializable

Core contract logic shared between Oracle and Requester Chains.

*Enforces chain-specific execution through `isOracleChain` flag.*


## State Variables
### factory
Address of the factory that deployed this contract.


```solidity
address public immutable factory;
```


### paymentAsset
ERC20 token used for reward payment.


```solidity
address public immutable paymentAsset;
```


### trustee
The trustee address allowed to update the request.


```solidity
address public immutable trustee;
```


### isOracleChain
Indicates whether this contract is on the OracleChain.


```solidity
bool public immutable isOracleChain;
```


### requester
The original requester encoded in bytes.


```solidity
bytes public requester;
```


### answerType
Type of answer expected.


```solidity
RequestTypes.AnswerType public answerType;
```


### createdAt
Timestamp when the request was created.


```solidity
uint40 public createdAt;
```


### challengeWindow
Duration in seconds during which the request can be challenged.


```solidity
uint40 public challengeWindow;
```


### status
Current status of the request.


```solidity
RequestTypes.RequestStatus public status;
```


### originAddress
Original address of the request on the source chain.


```solidity
bytes public originAddress;
```


### originChainId
Chain ID of the origin chain.


```solidity
bytes public originChainId;
```


### question
The question being asked.


```solidity
string public question;
```


### context
Contextual information related to the question.


```solidity
string public context;
```


### truthMeaning
Definition or explanation of what constitutes a true answer.


```solidity
string public truthMeaning;
```


### answer
Final answer returned by the oracle process.


```solidity
bytes public answer;
```


### rewardAmount
Reward amount offered for answering the request.


```solidity
uint96 public rewardAmount;
```


## Functions
### onlyFactory

Modifier to restrict access to the factory.


```solidity
modifier onlyFactory();
```

### onlyTrustee

Modifier to restrict access to the trustee.


```solidity
modifier onlyTrustee();
```

### constructor


```solidity
constructor(address _factory, address _paymentAsset, address _trustee, bool _isOracleChain);
```

### initialize

Initializes a request contract instance with provided parameters.

*Can only be called once by the factory. Sets metadata and request configuration.*


```solidity
function initialize(RequestTypes.RequestParams memory p) external initializer onlyFactory;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`p`|`RequestTypes.RequestParams`|The request parameters to initialize the contract with.|


### updateStatus

Updates the current status of the request.

*Can only be called by the trustee (e.g., OracleCoordinator).*


```solidity
function updateStatus(RequestTypes.RequestStatus _newStatus) external onlyTrustee;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_newStatus`|`RequestTypes.RequestStatus`|The new status to apply.|


### _updateStatus


```solidity
function _updateStatus(RequestTypes.RequestStatus _newStatus) internal;
```

### updateAnswer

Called by OracleCoordinator when a valid answer is proposed.


```solidity
function updateAnswer(bytes calldata _answer) external onlyTrustee;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_answer`|`bytes`|The proposed answer bytes (format depends on request type).|


### getFullPrompt

Returns a concatenated string including question, context, truthMeaning, and optionally the answer.


```solidity
function getFullPrompt() external view returns (string memory _answer);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`_answer`|`string`|A human-readable full prompt string for UI or off-chain processing.|


