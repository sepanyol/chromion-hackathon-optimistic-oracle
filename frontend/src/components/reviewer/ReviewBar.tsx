import { useIsClaimable } from "@/hooks/onchain/useIsClaimable";
import { isBoolean } from "lodash";
import { Address, isHex } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "../Button";
import { useClaimReward } from "@/hooks/onchain/useClaimReward";
import { useEffect, useState } from "react";
import { Loader } from "../Loader";

type ReviewBarType = {
  requestId?: Address;
  proposalVotes: number;
  challengeVotes: number;
  showWinner?: boolean;
  votedForChallenger?: boolean;
};

export const ReviewBar = ({
  requestId,
  showWinner = false,
  challengeVotes,
  proposalVotes,
  votedForChallenger,
}: ReviewBarType) => {
  const total = Number(challengeVotes) + Number(proposalVotes);
  const shareLeft = challengeVotes / total;
  const { address } = useAccount();
  const [hash, setHash] = useState<Address | null>(null);

  const { data: isClaimable, refetch } = useIsClaimable({
    account: address!,
    request: requestId!,
    enabled: showWinner && !!requestId,
  });

  const claimReward = useClaimReward({
    request: requestId!,
    enabled: showWinner && !!isClaimable && isHex(requestId),
  });

  const waitForClaim = useWaitForTransactionReceipt({
    hash: hash!,
    query: { enabled: !!hash },
  });

  useEffect(() => {
    if (!claimReward.hash) return;
    setHash(claimReward.hash);
  }, [claimReward.hash]);

  useEffect(() => {
    if (!waitForClaim.isSuccess) return;
    setTimeout(() => {
      setHash(null);
      refetch();
    }, 5000);
  }, [waitForClaim.isSuccess]);

  return (
    <div className="flex flex-col gap-1">
      {isBoolean(votedForChallenger) && (
        <div>
          You voted for {votedForChallenger ? " challenger" : " proposer"}
        </div>
      )}
      {showWinner ? (
        <span className="uppercase text-gray-800 font-bold flex items-center justify-between">
          <span>
            {challengeVotes > proposalVotes ? "Challenger" : "Proposer"}{" "}
            won&nbsp; 🥳
          </span>
          {isClaimable && (
            <Button
              disabled={
                claimReward.execution.isPending || waitForClaim.isLoading
              }
              onClick={(e) => {
                claimReward.write();
              }}
            >
              {claimReward.execution.isPending || waitForClaim.isLoading ? (
                <span className="flex gap-2">
                  <Loader className="text-white" /> in progess...
                </span>
              ) : waitForClaim.isSuccess ? (
                "Claimed!"
              ) : (
                "Claim your rewards"
              )}
            </Button>
          )}
        </span>
      ) : (
        <>
          <div className="flex rounded-lg relative text-sm px-2">
            <span className="text-gray-600 flex-1">Challenger</span>
            <span className="text-gray-600">Proposer</span>
          </div>
          <div className="bg-blue-200 h-6 flex rounded-lg overflow-auto relative">
            <div
              className="h-6 bg-purple-200 border-r border-r-black/30"
              style={{ width: `calc(100% * ${shareLeft})` }}
            ></div>
            <div className="inset-0 absolute flex text-sm items-center px-2">
              <span className="text-blue-900/80 flex-1">
                {challengeVotes} supporter{challengeVotes != 1 && "s"}
              </span>
              <span className="text-blue-900/60 ">
                {proposalVotes} supporter{proposalVotes != 1 && "s"}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
