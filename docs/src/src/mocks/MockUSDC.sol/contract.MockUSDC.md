# MockUSDC
**Inherits:**
ERC20

Simple ERC20 token used for testing USDC transfers


## State Variables
### failOnTransfer

```solidity
bool failOnTransfer = false;
```


## Functions
### constructor


```solidity
constructor() ERC20("Mock USD Coin", "mUSDC");
```

### mint


```solidity
function mint(address to, uint256 amount) external;
```

### decimals


```solidity
function decimals() public pure override returns (uint8);
```

### setFailOnTransfer


```solidity
function setFailOnTransfer(bool _failOnTransfer) external;
```

### transferFrom


```solidity
function transferFrom(address from, address to, uint256 value) public virtual override returns (bool);
```

### transfer


```solidity
function transfer(address to, uint256 amount) public virtual override returns (bool);
```

