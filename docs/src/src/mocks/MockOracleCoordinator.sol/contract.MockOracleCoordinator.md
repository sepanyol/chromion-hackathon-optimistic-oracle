# MockOracleCoordinator
**Inherits:**
[IOracleCoordinator](/src/interfaces/IOracleCoordinator.sol/interface.IOracleCoordinator.md)


## Functions
### registerRequest


```solidity
function registerRequest(address) external;
```

### proposeAnswer


```solidity
function proposeAnswer(address _request, bytes calldata _answer) external;
```

### challengeAnswer


```solidity
function challengeAnswer(address _request, bytes calldata _answer, bytes calldata _reason) external;
```

### submitReview


```solidity
function submitReview(address _request, bytes calldata _reason, bool _supportsChallenge) external;
```

### finalizeRequest


```solidity
function finalizeRequest(address _request) external;
```

### claimReward


```solidity
function claimReward(address _request) external;
```

### getRequests


```solidity
function getRequests(uint256 _limit, uint256 _offset)
    external
    view
    returns (address[] memory _requests, uint256 _totalCount);
```

### getProposal


```solidity
function getProposal(address _request) external view returns (Proposal memory);
```

### getChallenge


```solidity
function getChallenge(address _request) external view returns (Challenge memory);
```

### getReviews


```solidity
function getReviews(address _request) external view returns (Review[] memory);
```

### getReviewTally


```solidity
function getReviewTally(address _request) external view returns (uint256 _for, uint256 _against);
```

### getUserStats


```solidity
function getUserStats(address _user) external view returns (UserStats memory _userStats);
```

### isClaimable


```solidity
function isClaimable(address _request, address _claimer) external view returns (bool _is);
```

### isChallenged


```solidity
function isChallenged(address _request) external view returns (bool _is);
```

### getMostRecentPendingFinalization


```solidity
function getMostRecentPendingFinalization() external view returns (address __);
```

### checkUpkeep


```solidity
function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData);
```

### performUpkeep


```solidity
function performUpkeep(bytes calldata performData) external;
```

### FINALIZER_ROLE


```solidity
function FINALIZER_ROLE() external view returns (bytes32);
```

### FACTORY_ROLE


```solidity
function FACTORY_ROLE() external view returns (bytes32);
```

### REVIEW_WINDOW


```solidity
function REVIEW_WINDOW() external view returns (uint256);
```

### PROPOSER_BOND


```solidity
function PROPOSER_BOND() external view returns (uint256);
```

### CHALLENGER_BOND


```solidity
function CHALLENGER_BOND() external view returns (uint256);
```

### REVIEWER_BOND


```solidity
function REVIEWER_BOND() external view returns (uint256);
```

### usdc


```solidity
function usdc() external view returns (IERC20);
```

### outcomeIdFor


```solidity
function outcomeIdFor(address _request) public pure returns (bytes32 _id);
```

### outcomeIdAgainst


```solidity
function outcomeIdAgainst(address _request) public pure returns (bytes32 _id);
```

### reviewerVoteIdFor


```solidity
function reviewerVoteIdFor(address _request, address _reviewer) public pure returns (bytes32 _id);
```

### reviewerVoteIdAgainst


```solidity
function reviewerVoteIdAgainst(address _request, address _reviewer) public pure returns (bytes32 _id);
```

### proposalChallengeOutcome


```solidity
function proposalChallengeOutcome(bytes32) external view returns (bool);
```

## Events
### registerRequestEmit

```solidity
event registerRequestEmit();
```

