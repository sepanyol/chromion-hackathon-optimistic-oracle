export const fetchGasPrice = async (chainId: number) =>
  await fetch(
    `${
      process.env.NEXT_PUBLIC_GAS_API
    }/networks/${chainId.toString()}/suggestedGasFees`
  ).then(async (result) => await result.clone().json());
