import { useGetRequestAnswerBigInt } from "@/hooks/onchain/useGetRequestAnswerBigInt";
import { useGetRequestInfo } from "@/hooks/onchain/useGetRequestInfo";
import { formatUnits } from "viem";
import { useOracleContext } from "../OracleProvider";

type ProposedPriceProps = { id: bigint };
export const ProposedPrice = ({ id }: ProposedPriceProps) => {
  const { assetDecimals, assetSymbol } = useOracleContext();
  const getRequestInfo = useGetRequestInfo({ id });
  const getRequestAnswer = useGetRequestAnswerBigInt({
    address: getRequestInfo.data?.request,
  });

  if (!getRequestInfo.data || !getRequestInfo.data.isResolved) return <>n/a</>;

  return (
    <span>
      {formatUnits(getRequestAnswer.data || BigInt(0), assetDecimals!)}{" "}
      {assetSymbol}
    </span>
  );
};
