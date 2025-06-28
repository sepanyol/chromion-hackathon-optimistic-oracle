import { availableNetworks } from "./appkit/context";

export const getChainById = (id: number) => {
  const chain = availableNetworks.find(({ id }) => (id = id));
  if (!chain) throw new Error("Network not supported");
  return chain;
};
