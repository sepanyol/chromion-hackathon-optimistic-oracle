# IBaseRequestContract
Interface for interacting with request contracts across chains

*Used by the OracleCoordinator, Relayer, and other system modules*


## Functions
### initialize

Initializes a request contract instance with provided parameters.

*Can only be called once by the factory. Sets metadata and request configuration.*


```solidity
function initialize(RequestTypes.RequestParams memory p) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`p`|`RequestTypes.RequestParams`|The request parameters to initialize the contract with.|


### requester

Returns the address of the user who created the request


```solidity
function requester() external view returns (bytes memory);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bytes`|The requester address|


### rewardAmount

Returns the total reward amount allocated for this request


```solidity
function rewardAmount() external view returns (uint96);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint96`|The reward amount in USDC (6 decimals)|


### challengeWindow

Returns the challenge window set for this request


```solidity
function challengeWindow() external view returns (uint40);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint40`|Duration in seconds|


### status

Returns the current status of the request


```solidity
function status() external view returns (RequestTypes.RequestStatus);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`RequestTypes.RequestStatus`|The current request status|


### createdAt

Returns the timestamp when the request was created


```solidity
function createdAt() external view returns (uint40);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`uint40`|The creation time as a UNIX timestamp|


### question

Returns the question that defines the request


```solidity
function question() external view returns (string memory);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`string`|A natural-language question string|


### context

Returns the context that provides background for the question


```solidity
function context() external view returns (string memory);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`string`|Additional explanation of the context|


### truthMeaning

Returns the interpretation of "true" for the answer


```solidity
function truthMeaning() external view returns (string memory);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`string`|A natural-language explanation of what "true" means|


### answer

Returns the answer in bytes in order to process it


```solidity
function answer() external view returns (bytes memory);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bytes`|The answer in bytes|


### originAddress

Original address of the request on the source chain.


```solidity
function originAddress() external view returns (bytes memory);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bytes`|The origin address in bytes|


### originChainId

Chain ID of the origin chain.


```solidity
function originChainId() external view returns (bytes memory);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`bytes`|The origin Chain ID in bytes|


### updateStatus

Updates the current status of the request.

*Can only be called by the trustee (e.g., OracleCoordinator).*


```solidity
function updateStatus(RequestTypes.RequestStatus _newStatus) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_newStatus`|`RequestTypes.RequestStatus`|The new status to apply.|


### updateAnswer

Called by OracleCoordinator when a valid answer is proposed.


```solidity
function updateAnswer(bytes calldata _answer) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_answer`|`bytes`|The proposed answer bytes (format depends on request type).|


### getFullPrompt

Returns a concatenated string including question, context, truthMeaning, and optionally the answer.


```solidity
function getFullPrompt() external view returns (string memory);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`string`|_answer A human-readable full prompt string for UI or off-chain processing.|


## Events
### RequestInitialized
Emitted when the request is initialized from another chain


```solidity
event RequestInitialized(bytes indexed requester);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`requester`|`bytes`|The user who created the request|

### RequestStatusUpdated
Emitted when a status update is performed by the oracle coordinator or relayer


```solidity
event RequestStatusUpdated(RequestTypes.RequestStatus newStatus);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`newStatus`|`RequestTypes.RequestStatus`|The updated status of the request|

### RequestAnswerUpdated
Emitted when an answer update is performed by the oracle coordinator or relayer


```solidity
event RequestAnswerUpdated(bytes answer);
```

**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`answer`|`bytes`|The updated answer of the request|

