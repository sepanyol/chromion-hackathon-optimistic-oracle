import { useGetRequestInfo } from "@/hooks/onchain/useGetRequestInfo";
import { Button } from "../Button";

type TokenStatusProps = { id: bigint };
export const TokenStatus = ({ id }: TokenStatusProps) => {
  const getRequestInfo = useGetRequestInfo({ id });

  if (!getRequestInfo.data || !getRequestInfo.data.request)
    return <Button>Evaluate</Button>;

  return !getRequestInfo.data.isResolved ? (
    <span className="italic text-gray-400">pending...</span>
  ) : (
    <Button>Accept Price</Button>
  );
};
