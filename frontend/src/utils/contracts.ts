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
    factory: "0xF2143C3CFf75a8F6F59e9856A1972B81C020fdfe",
    oracle: "0x38AdC8e94D9D36371B76AECe6b9e42997C786790",
    usdc: "0x5d7d5a45dc75c27ddda489acd6af468b0a54295c",
    nftwrapper: "0x5008850991F83590717cC6aA148EafF1DDcbf18F",
  },
  [sepolia.id]: {
    factory: "0x50b69CB4b64DD238814913082F5C4145b1A975A6",
    usdc: "0xbb04b1d2cadee0f7954f783e96d47cb59f7a0b7d",
  },
  [arbitrumSepolia.id]: {
    factory: "0x723092f1563C878199e74AC1FDC96910bc79ab28",
    usdc: "0xdb76f7fdaeea53874d8f4795a99ffbc47a53a548",
  },
  [baseSepolia.id]: {
    factory: "0xd9240BafdA8bcbabCf6CE4c3932327692048831C",
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
