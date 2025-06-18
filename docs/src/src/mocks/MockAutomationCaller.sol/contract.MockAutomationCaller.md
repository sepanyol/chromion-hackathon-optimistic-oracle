# MockAutomationCaller
Simulates Chainlink Automation-compatible caller for OracleCoordinator


## State Variables
### coordinator

```solidity
address public coordinator;
```


## Functions
### constructor


```solidity
constructor(address _coordinator);
```

### triggerAutomation


```solidity
function triggerAutomation(bytes calldata performData) external;
```

