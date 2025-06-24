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
import { projectId, wagmiAdapter } from "../index";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "Chromion Optimistic Oracle",
  description: "AppKit Example",
  url: "https://reown.com/appkit", // origin must match your domain & subdomain
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

const solanaWeb3JsAdapter = new SolanaAdapter();

export const defaultChain = avalancheFuji;

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter /*, solanaWeb3JsAdapter */],
  projectId,
  themeVariables: {
    "--w3m-accent": "var(--color-blue-600)",
  },
  networks: [
    avalanche,
    avalancheFuji,
    mainnet,
    sepolia,
    arbitrum,
    arbitrumSepolia,
    base,
    baseSepolia,
    // solana,
    // solanaTestnet,
    // solanaDevnet,
  ],
  defaultNetwork: defaultChain,
  metadata: metadata,
  allowUnsupportedChain: true,
  features: {
    email: false,
    socials: false,
    analytics: true, // Optional - defaults to your Cloud configuration
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
