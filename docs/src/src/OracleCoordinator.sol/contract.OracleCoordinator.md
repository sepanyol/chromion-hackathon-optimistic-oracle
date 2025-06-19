# OracleCoordinator
**Inherits:**
[IOracleCoordinator](/src/interfaces/IOracleCoordinator.sol/interface.IOracleCoordinator.md), AccessControl, ReentrancyGuard

Manages answer proposals, challenges, review voting, and resolution of requests.


## State Variables
### FINALIZER_ROLE
*Role allowed to finalize requests*


```solidity
bytes32 public constant FINALIZER_ROLE = keccak256("FINALIZER_ROLE");
```


### FACTORY_ROLE
*Role allowed to register new requests*


```solidity
bytes32 public constant FACTORY_ROLE = keccak256("FACTORY_ROLE");
```


### REVIEW_WINDOW
*Duration in seconds for which a review phase is open*


```solidity
uint256 public constant REVIEW_WINDOW = 1 days;
```


### PROPOSER_BOND
*Bond amount in USDC required to submit a proposal*


```solidity
uint256 public constant PROPOSER_BOND = 100e6;
```


### CHALLENGER_BOND
*Bond amount in USDC required to challenge a proposal*


```solidity
uint256 public constant CHALLENGER_BOND = 100e6;
```


### REVIEWER_BOND
*Bond amount in USDC required for a reviewer to submit a review*


```solidity
uint256 public constant REVIEWER_BOND = 5e6;
```


### usdc
ERC20 token used for bonds and rewards (e.g., USDC)


```solidity
IERC20 public immutable usdc;
```


### relayer
Oracle Relayer to communicate cross chain


```solidity
IOracleRelayer public immutable relayer;
```


### platform
Address of the platform treasury or DAO


```solidity
address public platform;
```


### requestStore
*Maps a request address to its contract interface*


```solidity
mapping(address => IBaseRequestContract) private requestStore;
```


### proposalStore
*Maps a request address to its proposal state*


```solidity
mapping(address => Proposal) private proposalStore;
```


### userStats
*Maps user stats tp a specific user address*


```solidity
mapping(address => UserStats) private userStats;
```


### proposalChallengeOutcome
*Maps outcome keys to true if the outcome succeeded*


```solidity
mapping(bytes32 => bool) public proposalChallengeOutcome;
```


### reviewerClaimAmount
*Maps a request to the claimable reward amount for reviewers*


```solidity
mapping(address => uint256) public reviewerClaimAmount;
```


### reviewerVote
*Tracks which vote (for/against) a reviewer submitted*


```solidity
mapping(bytes32 => bool) private reviewerVote;
```


### reviewerRewarded
*Tracks if a reviewer has claimed their reward for a specific request*


```solidity
mapping(address => mapping(address => bool)) private reviewerRewarded;
```


### requests
*Set of registered request addresses*


```solidity
EnumerableSet.AddressSet private requests;
```


### nonFinalizedRequests
*Set of requests pending finalization*


```solidity
EnumerableSet.AddressSet private nonFinalizedRequests;
```


## Functions
### validRequest

*Ensures the given request is known*


```solidity
modifier validRequest(address _request);
```

### constructor

Deploys the coordinator contract


```solidity
constructor(address _platform, address _relayer, address _usdc);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_platform`|`address`|Address of the platform treasury or admin|
|`_relayer`|`address`||
|`_usdc`|`address`|ERC20 token used for all bond and reward transfers|


### registerRequest

===== Core Functions =====

*Requires FACTORY_ROLE. Transfers reward amount to this contract and updates internal mappings.*


```solidity
function registerRequest(address _request) external onlyRole(FACTORY_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request contract to register.|


### proposeAnswer

Proposes an answer to an open request.

*Requires bond payment in USDC. Stores proposer metadata and answer content.*


```solidity
function proposeAnswer(address _request, bytes calldata answer) external validRequest(_request) nonReentrant;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The request to answer.|
|`answer`|`bytes`||


### challengeAnswer

Challenges a proposed answer with a reason.

*Only allowed if the request is in Proposed status. Challenger must not be the original requester.*


```solidity
function challengeAnswer(address _request, bytes calldata answer, bytes calldata reason)
    external
    validRequest(_request)
    nonReentrant;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The request being challenged.|
|`answer`|`bytes`||
|`reason`|`bytes`||


### submitReview

Submits a review vote for a challenged request


```solidity
function submitReview(address _request, bytes calldata reason, bool supportsChallenge)
    external
    validRequest(_request)
    nonReentrant;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request|
|`reason`|`bytes`||
|`supportsChallenge`|`bool`||


### finalizeRequest

Finalizes a request after review/challenge period expires and distributes rewards


```solidity
function finalizeRequest(address _request) public validRequest(_request) nonReentrant onlyRole(FINALIZER_ROLE);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request to finalize|


### claimReward

Claims a reviewer reward if the vote was successful


```solidity
function claimReward(address _request) external nonReentrant;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request being claimed from|


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


### _maxLimit

Helper function to figure out the max limit of a list

*is used to not overflow the possible available limits of a list*


```solidity
function _maxLimit(uint256 limit, uint256 offset, uint256 count) internal pure returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`limit`|`uint256`|limit that has been targeted|
|`offset`|`uint256`|offset that has been targeted|
|`count`|`uint256`|the amount of entries the calculation should be based on|


### getProposal

Returns the full proposal information for a given request


```solidity
function getProposal(address _request) external view returns (Proposal memory _proposal);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`_proposal`|`Proposal`|Proposal struct with proposer, answer, timestamp, and optional challenge|


### getChallenge

Returns the challenge data for a given request


```solidity
function getChallenge(address _request) external view returns (Challenge memory _challenge);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`_challenge`|`Challenge`|Challenge struct with challenger data and reviews|


### getReviews

Returns all review votes submitted for a challenged request


```solidity
function getReviews(address _request) external view returns (Review[] memory _reviews);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|The address of the request|

**Returns**

|Name|Type|Description|
|----|----|-----------|
|`_reviews`|`Review[]`|Array of Review structs|


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


### _isClaimable

*Internal view function to determine if a user can claim a reward for a given request*


```solidity
function _isClaimable(address _request, address _claimer) internal view returns (bool _is);
```

### isChallenged

Checks if a request has been challenged


```solidity
function isChallenged(address _request) public view returns (bool _is);
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
function getMostRecentPendingFinalization() public view returns (address);
```
**Returns**

|Name|Type|Description|
|----|----|-----------|
|`<none>`|`address`|__ The address of the pending finalizable request|


### _isFinalizable

*Returns whether a request is eligible for finalization and its current status*


```solidity
function _isFinalizable(address _request) internal view returns (bool _is, RequestTypes.RequestStatus _status);
```

### outcomeIdFor

Returns the computed outcome id for a challenged proposal of a given request


```solidity
function outcomeIdFor(address _request) public pure returns (bytes32 _id);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|address of the request|


### outcomeIdAgainst

Returns the computed outcome id against a challenged proposal of a given request


```solidity
function outcomeIdAgainst(address _request) public pure returns (bytes32 _id);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|address of the request|


### reviewerVoteIdFor

Returns the computed reviewer vote for a challenged proposal of a given request


```solidity
function reviewerVoteIdFor(address _request, address _reviewer) public pure returns (bytes32 _id);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|address of the request|
|`_reviewer`|`address`|address of the reviewer|


### reviewerVoteIdAgainst

Returns the computed reviewer vote against a challenged proposal of a given request


```solidity
function reviewerVoteIdAgainst(address _request, address _reviewer) public pure returns (bytes32 _id);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`_request`|`address`|address of the request|
|`_reviewer`|`address`|address of the reviewer|


### _updateRequestStatus


```solidity
function _updateRequestStatus(address _request, RequestTypes.RequestStatus _status) internal;
```

### _updateRequestAnswer


```solidity
function _updateRequestAnswer(address _request, bytes memory _answer) internal;
```

### checkUpkeep

Chainlink Automation check if upkeep is needed


```solidity
function checkUpkeep(bytes calldata) external view returns (bool upkeepNeeded, bytes memory performData);
```

### performUpkeep

Chainlink Automation perform function for upkeep execution


```solidity
function performUpkeep(bytes calldata performData) external;
```

