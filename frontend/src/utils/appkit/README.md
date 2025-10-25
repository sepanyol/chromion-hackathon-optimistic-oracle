# AppKit Configuration

This directory contains the Web3 wallet connection configuration using Reown AppKit (formerly WalletConnect).

## Files

- `index.ts` - Main configuration file with network definitions and utilities
- `context/index.tsx` - React context provider for AppKit integration

## Recent Updates

### Enhanced Network Support
- Added Optimism and Optimism Sepolia networks
- Centralized network configuration for better maintainability
- Added network utility functions for oracle and USDC support detection

### Improved Configuration
- Enhanced project ID validation with better error messages
- Added network configuration object with categorized networks
- Implemented utility functions for network management

### Better UX Features
- Updated metadata with proper project description
- Enabled onramp functionality for easier token acquisition
- Centralized network configuration across the application

## Network Configuration

The application supports both mainnet and testnet networks:

### Mainnets
- Ethereum Mainnet
- Avalanche C-Chain
- Arbitrum One
- Base
- Polygon
- Optimism

### Testnets
- Sepolia (Ethereum)
- Avalanche Fuji
- Arbitrum Sepolia
- Base Sepolia
- Polygon Mumbai
- Optimism Sepolia

## Oracle Support

The optimistic oracle is currently deployed on:
- Avalanche Fuji (Primary)
- Base Sepolia (Secondary)
- Sepolia (Ethereum testnet)

## Usage

```typescript
import { networks, networkConfig, networkUtils } from './utils/appkit';

// Check if a network supports the oracle
const isSupported = networkUtils.isOracleSupported(chainId);

// Get network by ID
const network = networkUtils.getNetworkById(chainId);

// Check USDC support
const hasUsdc = networkUtils.hasUsdcSupport(chainId);
```
