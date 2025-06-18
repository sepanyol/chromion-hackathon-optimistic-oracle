# RequestTypes
Contains enums and structs used throughout the cross-chain request system.


## Structs
### RequestParams
Encapsulates all parameters needed to initialize a request.


```solidity
struct RequestParams {
    bytes requester;
    bytes originAddress;
    bytes originChainId;
    AnswerType answerType;
    uint40 challengeWindow;
    uint96 rewardAmount;
    string question;
    string context;
    string truthMeaning;
    bool isCrossChain;
}
```

## Enums
### RequestStatus
Represents the lifecycle status of a request.


```solidity
enum RequestStatus {
    Pending,
    Open,
    Proposed,
    Challenged,
    Resolved,
    Failed
}
```

### AnswerType
Describes the type of answer expected for a request.


```solidity
enum AnswerType {
    Bool,
    Value
}
```

