import oracleAbi from "@/abis/coordinator.json";
import factoryAbi from "@/abis/factory.json";
import { defaultChain } from "@/utils/appkit/context";
import { getFactoryByChainId, getOracleByChainId } from "@/utils/contracts";
import { useEvmClients } from "@s3panyol/use-evm-transaction-flow";
import { useQuery } from "@tanstack/react-query";
import { createContext, PropsWithChildren, useContext } from "react";
import { Abi, Address, erc20Abi } from "viem";
import { usePublicClient } from "wagmi";

type OracleType = {
  asset: Address | null;
  assetDecimals: number | null;
  assetSymbol: string | null;
  assetName: string | null;
  reviewWindow: bigint | null;
  proposerBond: bigint | null;
  challengerBond: bigint | null;
  reviewerBond: bigint | null;
  isOracleLoaded: boolean;
};

const initialState: OracleType = {
  asset: null,
  assetDecimals: null,
  assetSymbol: null,
  assetName: null,
  reviewWindow: null,
  proposerBond: null,
  challengerBond: null,
  reviewerBond: null,
  isOracleLoaded: false,
};

const OracleContext = createContext<OracleType>({ ...initialState });

export const useOracleContext = () => {
  const context = useContext(OracleContext);
  if (context === undefined)
    throw new Error("useOracleContext was used outside of its provider");
  return context;
};

const OracleProvider = function ({ children }: PropsWithChildren) {
  const { publicClient } = useEvmClients();
  const publicClientOracleChain = usePublicClient({ chainId: defaultChain.id });

  const calls: any[] = [
    publicClientOracleChain?.multicall({
      allowFailure: false,
      contracts: [
        "REVIEW_WINDOW",
        "PROPOSER_BOND",
        "CHALLENGER_BOND",
        "REVIEWER_BOND",
        "usdc",
      ].map((functionName) => ({
        abi: oracleAbi as Abi,
        functionName,
        address: getOracleByChainId(publicClientOracleChain.chain.id)!,
      })),
    }),
  ];

  if (publicClient?.chain.id != publicClientOracleChain?.chain.id) {
    calls.push(
      publicClient?.readContract({
        abi: factoryAbi as Abi,
        functionName: "paymentAsset",
        address: getFactoryByChainId(publicClient.chain.id)!,
      })
    );
  }

  const oracleQuery = useQuery({
    queryKey: ["oracle-base-data", publicClient?.chain.id],
    queryFn: () => Promise.all(calls),
    select: ([oracleData, factoryData]) => ({
      reviewWindow: oracleData![0] as bigint,
      proposerBond: oracleData![1] as bigint,
      challengerBond: oracleData![2] as bigint,
      reviewerBond: oracleData![3] as bigint,
      asset: (factoryData || oracleData![4]) as Address,
    }),
  });

  const assetQuery = useQuery({
    queryKey: ["oracle-asset", publicClient?.chain.id, oracleQuery.data?.asset],
    queryFn: async () =>
      publicClient?.multicall({
        allowFailure: false,
        contracts: ["decimals", "symbol", "name"].map((functionName) => ({
          abi: erc20Abi,
          functionName,
          address: oracleQuery.data?.asset!,
        })),
      }),
    enabled: !!oracleQuery.data?.asset,
    select: (data) => ({
      assetDecimals: data![0] as number,
      assetSymbol: data![1] as string,
      assetName: data![2] as string,
    }),
  });

  return (
    <OracleContext.Provider
      value={
        oracleQuery.data && assetQuery.data
          ? { ...oracleQuery.data, ...assetQuery.data, isOracleLoaded: true }
          : { ...initialState }
      }
    >
      {children}
    </OracleContext.Provider>
  );
};

export default OracleProvider;
