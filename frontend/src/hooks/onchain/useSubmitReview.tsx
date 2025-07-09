import abi from "@/abis/coordinator.json";
import { useOracleContext } from "@/components/OracleProvider";
import { defaultChain } from "@/utils/appkit/context";
import { getOracleByChainId, getUSDCByChainId } from "@/utils/contracts";
import { useEvmTransactionFlow } from "@s3panyol/use-evm-transaction-flow";
import { Abi, Address } from "viem";

type useSubmitReviewProps = {
  request: Address;
  reason: string;
  supportChallenge: boolean | null;
};

export const useSubmitReview = ({
  request,
  reason,
  supportChallenge,
}: useSubmitReviewProps) => {
  const { reviewerBond } = useOracleContext();
  const oracleAddress = getOracleByChainId(defaultChain.id)!;
  return useEvmTransactionFlow({
    abi: abi as Abi,
    tokenAddress: getUSDCByChainId(defaultChain.id),
    contractAddress: oracleAddress,
    spender: oracleAddress,
    args: [request, reason, supportChallenge],
    functionName: "submitReview",
    tokenType: "ERC20",
    amount: reviewerBond!,
  });
};
