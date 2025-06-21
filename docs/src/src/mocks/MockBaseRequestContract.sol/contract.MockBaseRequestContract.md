# MockBaseRequestContract
**Inherits:**
[IBaseRequestContract](/src/interfaces/IBaseRequestContract.sol/interface.IBaseRequestContract.md)

Mock implementation of IBaseRequestContract for testing OracleCoordinator


## State Variables
### requester

```solidity
bytes public requester;
```


### reward

```solidity
uint96 public reward;
```


### status

```solidity
RequestTypes.RequestStatus public status;
```


### created

```solidity
uint40 public created;
```


### challengeWindowLength

```solidity
uint40 public challengeWindowLength;
```


### answer

```solidity
bytes public answer;
```


### originAddress

```solidity
bytes public originAddress;
```


### originChainId

```solidity
bytes public originChainId;
```


### questionText

```solidity
string public questionText;
```


### contextText

```solidity
string public contextText;
```


### truthText

```solidity
string public truthText;
```


## Functions
### constructor


```solidity
constructor(
    bytes memory _requester,
    uint96 _reward,
    uint40 _challengeWindowLength,
    string memory _question,
    string memory _context,
    string memory _truthMeaning
);
```

### initialize


```solidity
function initialize(RequestTypes.RequestParams memory p) external;
```

### rewardAmount


```solidity
function rewardAmount() external view returns (uint96);
```

### challengeWindow


```solidity
function challengeWindow() external view returns (uint40);
```

### updateStatus


```solidity
function updateStatus(RequestTypes.RequestStatus newStatus) external;
```

### updateAnswer


```solidity
function updateAnswer(bytes calldata _answer) external;
```

### createdAt


```solidity
function createdAt() external view returns (uint40);
```

### question


```solidity
function question() external view returns (string memory);
```

### context


```solidity
function context() external view returns (string memory);
```

### truthMeaning


```solidity
function truthMeaning() external view returns (string memory);
```

### getFullPrompt


```solidity
function getFullPrompt() external pure returns (string memory);
```

