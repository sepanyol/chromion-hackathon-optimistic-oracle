import { availableNetworks } from "./appkit/context";

export const getChainById = (chainId: number) => {
  const chain = availableNetworks.find(({ id }) => id == chainId);
  if (!chain) throw new Error("Network not supported");
  return chain;
};
