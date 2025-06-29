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
    factory: "0xBFAaA21195dA0D23102907da80d96D350E84d925",
    oracle: "0x75b9F569102FA84BfA7495a008C221bbc7132B83",
    usdc: "0x5d7d5a45dc75c27ddda489acd6af468b0a54295c",
    nftwrapper: "0x5008850991F83590717cC6aA148EafF1DDcbf18F",
  },
  [sepolia.id]: {
    factory: "0x9EBcFbC2ed83e94945661F34f86e28d4b7170f81",
    usdc: "0xbb04b1d2cadee0f7954f783e96d47cb59f7a0b7d",
  },
  [arbitrumSepolia.id]: {
    factory: "0x17Abf983927B4EdD8aE222cD261C152C3d85e10f",
    usdc: "0xdb76f7fdaeea53874d8f4795a99ffbc47a53a548",
  },
  [baseSepolia.id]: {
    factory: "0x002183a31BF72c829b32196C053d3F38cB53ff4d",
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
