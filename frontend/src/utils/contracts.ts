import { Address } from "viem";
import { avalancheFuji } from "viem/chains";

const contractsByChainId: {
  [key: number]: { factory: Address; oracle: Address; usdc: Address };
} = {
  [avalancheFuji.id]: {
    factory: "0x12B33F486a69b568651B51253077D1729fBe6a5d",
    oracle: "0xF15BB9041EEC4169c32C93E05415e7c718961e10",
    usdc: "0x5d7d5a45dc75c27ddda489acd6af468b0a54295c",
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
