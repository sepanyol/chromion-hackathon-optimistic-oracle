import abi from "@/abis/request.json";
import { Address, hexToBigInt } from "viem";
import { useReadContract } from "wagmi";

type UseGetRequestAnswerBigIntProps = { address?: Address };
export const useGetRequestAnswerBigInt = ({
  address,
}: UseGetRequestAnswerBigIntProps) =>
  useReadContract({
    abi: abi,
    address: address,
    functionName: "answer",
    query: {
      enabled: !!address,
      select: (res: any) => hexToBigInt(res),
      retry: false,
    },
  });
