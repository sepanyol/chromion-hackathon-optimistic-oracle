"use client";

import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import {
  AppKitNetwork,
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  mainnet,
  sepolia,
} from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { projectId, wagmiAdapter, networks, networkConfig } from "../index";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Environment detection (Billoq-style)
const isMainnet = process.env.NEXT_PUBLIC_ENVIRONMENT === 'mainnet';

// Set up metadata (Billoq-style with environment awareness)
const metadata = {
  name: "Equolibrium Oracle",
  description: `Decentralized Oracle Network for Cross-Chain Data Verification - ${isMainnet ? 'Mainnet' : 'Testnet'} Mode`,
  url: "https://chromion-hackathon-optimistic-oracle.vercel.app",
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

const solanaWeb3JsAdapter = new SolanaAdapter();

// Log environment info for debugging (Billoq-style)
console.log(`🌍 AppKit Environment: ${isMainnet ? 'Mainnet' : 'Testnet'}`);
console.log(`📡 Supported Networks:`, networks.map(n => n.name));

// Create the modal (Billoq-style configuration)
const modal = createAppKit({
  adapters: [wagmiAdapter /*, solanaWeb3JsAdapter */],
  projectId,
  themeVariables: {
    "--w3m-accent": "var(--color-blue-600)",
  },
  networks: networks as any, // Use the centralized network configuration
  defaultNetwork: networkConfig.defaultNetwork,
  metadata: metadata,
  allowUnsupportedChain: true,
  features: {
    email: false,
    socials: false,
    analytics: true, // Optional - defaults to your Cloud configuration
    onramp: isMainnet, // Enable onramp only for mainnet
  },
  // Optional: Add environment-specific features (Billoq-style)
  ...(isMainnet ? {
    // Mainnet specific configurations
    enableExplorer: true,
  } : {
    // Testnet specific configurations
    enableExplorer: true,
    enableOnramp: false, // Disable on-ramp for testnets
  })
});

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
