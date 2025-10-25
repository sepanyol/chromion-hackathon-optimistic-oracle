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
} from "@reown/appkit/networks";
import { cookieStorage, createStorage } from "@wagmi/core";

// Get project ID from environment variables with fallback
export const projectId = process.env.NEXT_PUBLIC_APPKIT_PROJECT_ID || "a9fbadc760baa309220363ec867b732e";

// Validate project ID
if (!projectId || projectId.length < 32) {
  throw new Error("Invalid or missing AppKit Project ID. Please check your NEXT_PUBLIC_APPKIT_PROJECT_ID environment variable.");
}

// Define supported networks for the application
export const networks = [
  // Mainnets
  mainnet,
  avalanche,
  arbitrum,
  base,
  polygon,
  optimism,
  
  // Testnets
  sepolia,
  avalancheFuji,
  arbitrumSepolia,
  baseSepolia,
  polygonMumbai,
  optimismSepolia,
];

// Network configuration for better UX
export const networkConfig = {
  // Default network for new users
  defaultNetwork: avalancheFuji,
  
  // Networks that support the optimistic oracle
  oracleSupportedNetworks: [
    avalancheFuji, // Primary testnet
    baseSepolia,   // Secondary testnet
    sepolia,       // Ethereum testnet
  ],
  
  // Networks with native USDC support
  usdcSupportedNetworks: [
    mainnet,
    arbitrum,
    base,
    polygon,
    optimism,
  ],
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
    return [mainnet, avalanche, arbitrum, base, polygon, optimism];
  },
  
  /**
   * Get all testnet networks
   */
  getTestnets: () => {
    return networkConfig.oracleSupportedNetworks;
  },
};
