"use client";

import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import {
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

// Set up metadata
const metadata = {
  name: "Chromion Optimistic Oracle",
  description: "Decentralized Oracle Network for Cross-Chain Data Verification",
  url: "https://chromion-hackathon-optimistic-oracle.vercel.app", // Updated to match project domain
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

const solanaWeb3JsAdapter = new SolanaAdapter();

// Create the modal
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
    onramp: true, // Enable onramp for easier token acquisition
  },
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
