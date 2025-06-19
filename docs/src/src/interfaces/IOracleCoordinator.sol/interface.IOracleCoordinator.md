# IOracleCoordinator
**Inherits:**
AutomationCompatibleInterface

Interface for the OracleCoordinator contract responsible for coordinating oracle answer proposals,
challenges, review voting, and request finalization. It integrates with Chainlink Automation for lifecycle handling.


## Functions
### registerRequest

Registers a new request created on the Oracle Chain.

*Requires FACTORY_ROLE. Transfers reward amount to this contract and updates internal mappings.*


```solidity
function registerRequest(address _request) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request contract to register.|


### proposeAnswer

Proposes an answer to an open request.

*Requires bond payment in USDC. Stores proposer metadata and answer content.*


```solidity
function proposeAnswer(address _request, bytes calldata _answer) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The request to answer.|
|`_answer`|`bytes`|The raw answer data.|


### challengeAnswer

Challenges a proposed answer with a reason.

*Only allowed if the request is in Proposed status. Challenger must not be the original requester.*


```solidity
function challengeAnswer(address _request, bytes calldata _answer, bytes calldata _reason) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The request being challenged.|
|`_answer`|`bytes`|The answer being disputed.|
|`_reason`|`bytes`|A justification string or hash indicating why the answer is incorrect.|


### submitReview

Submits a review vote for a challenged request


```solidity
function submitReview(address _request, bytes calldata _reason, bool _supportsChallenge) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request|
|`_reason`|`bytes`|Justification for the vote (encoded)|
|`_supportsChallenge`|`bool`|Whether the vote supports the challenge or not|


### finalizeRequest

Finalizes a request after review/challenge period expires and distributes rewards


```solidity
function finalizeRequest(address _request) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request to finalize|


### claimReward

Claims a reviewer reward if the vote was successful


```solidity
function claimReward(address _request) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request being claimed from|


### FINALIZER_ROLE

*Role allowed to finalize requests*


```solidity
function FINALIZER_ROLE() external view returns (bytes32);
```

### FACTORY_ROLE

*Role allowed to register new requests*


```solidity
function FACTORY_ROLE() external view returns (bytes32);
```

### REVIEW_WINDOW

*Duration in seconds for which a review phase is open*


```solidity
function REVIEW_WINDOW() external view returns (uint256);
```

### PROPOSER_BOND

*Bond amount in USDC required to submit a proposal*


```solidity
function PROPOSER_BOND() external view returns (uint256);
```

### CHALLENGER_BOND

*Bond amount in USDC required to challenge a proposal*


```solidity
function CHALLENGER_BOND() external view returns (uint256);
```

### REVIEWER_BOND

*Bond amount in USDC required for a reviewer to submit a review*


```solidity
function REVIEWER_BOND() external view returns (uint256);
```

### usdc

ERC20 token used for bonds and rewards (e.g., USDC)


```solidity
function usdc() external view returns (IERC20);
```

### proposalChallengeOutcome

Challenge outcome a specific proposel (computed bytes32)


```solidity
function proposalChallengeOutcome(bytes32) external view returns (bool);
```

### outcomeIdFor

Returns the computed outcome id for a challenged proposal of a given request


```solidity
function outcomeIdFor(address _request) external pure returns (bytes32 _id);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|address of the request|


### outcomeIdAgainst

Returns the computed outcome id against a challenged proposal of a given request


```solidity
function outcomeIdAgainst(address _request) external pure returns (bytes32 _id);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|address of the request|


### reviewerVoteIdFor

Returns the computed reviewer vote for a challenged proposal of a given request


```solidity
function reviewerVoteIdFor(address _request, address _reviewer) external pure returns (bytes32 _id);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|address of the request|
|`_reviewer`|`address`|address of the reviewer|


### reviewerVoteIdAgainst

Returns the computed reviewer vote against a challenged proposal of a given request


```solidity
function reviewerVoteIdAgainst(address _request, address _reviewer) external pure returns (bytes32 _id);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|address of the request|
|`_reviewer`|`address`|address of the reviewer|


### getRequests

Returns a list of protocols based on the service provider address


```solidity
function getRequests(uint256 _limit, uint256 _offset)
    external
    view
    returns (address[] memory _requests, uint256 _totalCount);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_limit`|`uint256`|amount of requests|
|`_offset`|`uint256`|index to start from until limit|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`_requests`|`address[]`|list of requests|
|`_totalCount`|`uint256`|total amount of requests|


### getProposal

Returns the full proposal information for a given request


```solidity
function getProposal(address _request) external view returns (Proposal memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`Proposal`|Proposal struct with proposer, answer, timestamp, and optional challenge|


### getChallenge

Returns the challenge data for a given request


```solidity
function getChallenge(address _request) external view returns (Challenge memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`Challenge`|Challenge struct with challenger data and reviews|


### getReviews

Returns all review votes submitted for a challenged request


```solidity
function getReviews(address _request) external view returns (Review[] memory);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`Review[]`|Array of Review structs|


### getReviewTally

Returns vote tally for a challenge on a given request


```solidity
function getReviewTally(address _request) external view returns (uint256 _for, uint256 _against);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`_for`|`uint256`|Number of votes supporting the challenge|
|`_against`|`uint256`|Number of votes opposing the challenge|


### getUserStats

Returns statistics for a specific user


```solidity
function getUserStats(address _user) external view returns (UserStats memory _userStats);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_user`|`address`|The address of the user|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`_userStats`|`UserStats`|UserStats struct with proposal/review metrics|


### isClaimable

Checks if a reviewer is eligible to claim a reward for a request


```solidity
function isClaimable(address _request, address _claimer) external view returns (bool _is);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request|
|`_claimer`|`address`|The address of the reviewer|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`_is`|`bool`|True if the reward can be claimed|


### isChallenged

Checks if a request has been challenged


```solidity
function isChallenged(address _request) external view returns (bool _is);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`_is`|`bool`|True if the request has an active challenge|


### getMostRecentPendingFinalization

Returns the most recently added request eligible for finalization


```solidity
function getMostRecentPendingFinalization() external view returns (address __);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`__`|`address`|The address of the pending finalizable request|


## Events
### RequestRegistered
Emitted when a new request is registered from non-EVM chain


```solidity
event RequestRegistered(address indexed request, bytes requester);
```

### AnswerProposed
Emitted when an answer is proposed for a request


```solidity
event AnswerProposed(address indexed request, address indexed proposer, bytes answer);
```

### ChallengeSubmitted
Emitted when a challenge is submitted to a proposal


```solidity
event ChallengeSubmitted(address indexed request, address indexed challenger, bytes answer, bytes reason);
```

### ReviewSubmitted
Emitted when a review is submitted by a reviewer


```solidity
event ReviewSubmitted(address indexed request, address indexed reviewer, bytes reason, bool supportsChallenge);
```

### RequestResolved
Emitted when a request is resolved/finalized


```solidity
event RequestResolved(address indexed request, RequestTypes.RequestStatus outcome);
```

### RewardDistributed
Emitted when a reward is distributed to a participant


```solidity
event RewardDistributed(address indexed request, address indexed recipient, uint256 amount);
```

### BondRefunded
Emitted when a bond is refunded to a participant


```solidity
event BondRefunded(address indexed request, address indexed recipient, uint256 amount);
```

## Structs
### Review
Represents a review vote submitted during a challenge phase


```solidity
struct Review {
    address reviewer;
    uint40 timestamp;
    bytes reason;
    bool supportsChallenge;
}
```

### Challenge
Represents a challenge against a proposed answer


```solidity
struct Challenge {
    address challenger;
    uint40 timestamp;
    bytes answer;
    bytes reason;
    uint256 votesFor;
    uint256 votesAgainst;
    Review[] reviews;
}
```

### Proposal
Represents an answer proposal for a request


```solidity
struct Proposal {
    address proposer;
    uint40 timestamp;
    bytes answer;
    Challenge challenge;
}
```

### UserStats
Statistics for a participant's activity within the protocol


```solidity
struct UserStats {
    uint256 proposed;
    uint256 proposedSuccess;
    uint256 challenged;
    uint256 challengedSuccess;
    uint256 reviewed;
    uint256 reviewedSuccess;
}
```

