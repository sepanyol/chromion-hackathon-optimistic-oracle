import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  optimism,
  optimismSepolia,
  lisk,
  liskSepolia,
  bsc,
  bscTestnet,
} from "@reown/appkit/networks";
import { cookieStorage, createStorage } from "@wagmi/core";

// Get project ID from environment variables with fallback (Billoq-style)
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "a9fbadc760baa309220363ec867b732e";

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Environment detection (Billoq-style)
const isMainnet = process.env.NEXT_PUBLIC_ENVIRONMENT === 'mainnet';

// Dynamic network configuration based on environment (Billoq-style)
const mainnetNetworks: [any, ...any[]] = [lisk, arbitrum, base, bsc];
const testnetNetworks: [any, ...any[]] = [sepolia, liskSepolia, arbitrumSepolia, bscTestnet];

// Use appropriate networks based on environment (always ensure at least one network)
export const networks = isMainnet ? mainnetNetworks : testnetNetworks;

// Network configuration for better UX (Billoq-style environment awareness)
export const networkConfig = {
  // Default network for new users (environment-aware)
  defaultNetwork: isMainnet ? lisk : liskSepolia,
  
  // Networks that support the optimistic oracle
  oracleSupportedNetworks: isMainnet 
    ? [lisk, arbitrum, base] 
    : [liskSepolia, arbitrumSepolia, sepolia],
  
  // Networks with native USDC support
  usdcSupportedNetworks: isMainnet
    ? [mainnet, arbitrum, base, lisk, bsc]
    : [sepolia, arbitrumSepolia, liskSepolia, bscTestnet],
  
  // Environment info
  isMainnet,
};

// Create Wagmi adapter with enhanced configuration
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

// Export the wagmi config for use in other parts of the application
export const config = wagmiAdapter.wagmiConfig;

// Utility functions for network management
export const networkUtils = {
  /**
   * Check if a network supports the optimistic oracle
   */
  isOracleSupported: (chainId: number): boolean => {
    return networkConfig.oracleSupportedNetworks.some(network => network.id === chainId);
  },
  
  /**
   * Check if a network has native USDC support
   */
  hasUsdcSupport: (chainId: number): boolean => {
    return networkConfig.usdcSupportedNetworks.some(network => network.id === chainId);
  },
  
  /**
   * Get network by chain ID
   */
  getNetworkById: (chainId: number) => {
    return networks.find(network => network.id === chainId);
  },
  
  /**
   * Get all mainnet networks
   */
  getMainnets: () => {
    return mainnetNetworks;
  },
  
  /**
   * Get all testnet networks
   */
  getTestnets: () => {
    return testnetNetworks;
  },
  
  /**
   * Get current environment
   */
  getCurrentEnvironment: () => {
    return isMainnet ? 'mainnet' : 'testnet';
  },
  
  /**
   * Get supported chains based on environment
   */
  getSupportedChains: () => {
    return isMainnet 
      ? ["Lisk", "Arbitrum", "Base", "BSC"]
      : ["Ethereum Sepolia", "Lisk Sepolia", "Arbitrum Sepolia", "BSC Testnet"];
  },
};
