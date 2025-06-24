import { Address } from "viem";
import {
  arbitrumSepolia,
  avalancheFuji,
  baseSepolia,
  sepolia,
} from "viem/chains";

const contractsByChainId: {
  [key: number]: { factory: Address; oracle?: Address; usdc: Address };
} = {
  [avalancheFuji.id]: {
    factory: "0x12B33F486a69b568651B51253077D1729fBe6a5d",
    oracle: "0xF15BB9041EEC4169c32C93E05415e7c718961e10",
    usdc: "0x5d7d5a45dc75c27ddda489acd6af468b0a54295c",
  },
  [sepolia.id]: {
    factory: "0x56f81811dBA27107641b0ddb249246eE4c1A9D67",
    usdc: "0xbb04b1d2cadee0f7954f783e96d47cb59f7a0b7d",
  },
  [arbitrumSepolia.id]: {
    factory: "0x44d62D55BeDAe8DEAc46180065De0E2eE5FA0349",
    usdc: "0xdb76f7fdaeea53874d8f4795a99ffbc47a53a548",
  },
  [baseSepolia.id]: {
    factory: "0x3F591F0Ae877bE2b35FD8616439c3E0a2b88f57E",
    usdc: "0x8cd493fdf0c8f61e0d6f99b9ee5303e1a9ec78f7",
  },
};

export const getFactoryByChainId = (chainId: number) => {
  if (!contractsByChainId[chainId])
    throw new Error(`Chain with ID ${chainId} not supported`);

  return contractsByChainId[chainId].factory;
};

export const getOracleByChainId = (chainId: number) => {
  if (!contractsByChainId[chainId])
    throw new Error(`Chain with ID ${chainId} not supported`);

  return contractsByChainId[chainId].oracle;
};

export const getUSDCByChainId = (chainId: number) => {
  if (!contractsByChainId[chainId])
    throw new Error(`Chain with ID ${chainId} not supported`);

  return contractsByChainId[chainId].usdc;
};
