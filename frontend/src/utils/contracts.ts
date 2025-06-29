import { Address } from "viem";
import {
  arbitrumSepolia,
  avalancheFuji,
  baseSepolia,
  sepolia,
} from "viem/chains";

const contractsByChainId: {
  [key: number]: {
    factory: Address;
    oracle?: Address;
    nftwrapper?: Address; // TODO make mandatory when multichain
    usdc: Address;
  };
} = {
  // TODO extend
  [avalancheFuji.id]: {
    factory: "0xf1b04336b6AB23DCB4B790CDdBb334E178Ed4af7",
    oracle: "0x4174c9a43DAcC5CEAAc214aCeeB1fEc22919cBe3",
    usdc: "0x5d7d5a45dc75c27ddda489acd6af468b0a54295c",
    nftwrapper: "0x5008850991F83590717cC6aA148EafF1DDcbf18F",
  },
  [sepolia.id]: {
    factory: "0x8De61d3d4785E692Fe7425bBEfF28509221e6958",
    usdc: "0xbb04b1d2cadee0f7954f783e96d47cb59f7a0b7d",
  },
  [arbitrumSepolia.id]: {
    factory: "0xbDF676AE20BeBFf9E4246A0e808054D9d7749A7b",
    usdc: "0xdb76f7fdaeea53874d8f4795a99ffbc47a53a548",
  },
  [baseSepolia.id]: {
    factory: "0x17Abf983927B4EdD8aE222cD261C152C3d85e10f",
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
export const getNFTWrapperByChainId = (chainId: number) => {
  if (!contractsByChainId[chainId])
    throw new Error(`Chain with ID ${chainId} not supported`);

  if (!contractsByChainId[chainId].nftwrapper)
    throw new Error(`Wrapper not supported on this chain`);

  return contractsByChainId[chainId].nftwrapper;
};
