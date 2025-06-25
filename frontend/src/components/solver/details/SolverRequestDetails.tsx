"use client";

import { Button } from "@/components/Button";
import { Loader } from "@/components/Loader";
import { RequestDetails } from "@/components/request-details/RequestDetails";
import { useGetProposal } from "@/hooks/onchain/useGetProposal";
import { useSubmitProposal } from "@/hooks/onchain/useSubmitProposal";
import { useRequestForProposal } from "@/hooks/useRequestForProposal";
import { useUserProposer } from "@/hooks/useUserProposer";
import { getReadableRequestStatus } from "@/utils/helpers";
import { timeAgo } from "@/utils/time-ago";
import { isBoolean, isNumber } from "lodash";
import { useCallback, useEffect, useState } from "react";
import {
  Address,
  bytesToBool,
  formatUnits,
  hexToBool,
  pad,
  stringToBytes,
  toBytes,
  toHex,
} from "viem";
import { useAccount } from "wagmi";
import { SolverBool } from "./SolverBool";
import { CheckCircle } from "lucide-react";
import { isSameAddress } from "@/utils/addresses";
import { ColoredTile } from "@/components/ColoredTile";

type SolverRequestDetailsProps = { requestId: Address };
export const SolverRequestDetails = ({
  requestId,
}: SolverRequestDetailsProps) => {
  const [proposalValue, setProposalValue] = useState<any>(null);
  const [proposalValueComputed, setProposalValueComputed] = useState<string>();
  const [proposalValueValid, setProposalValueValid] = useState(false);

  const { address: accountAddress } = useAccount();

  const {
    data: request,
    isLoading,
    refetch,
  } = useRequestForProposal(requestId);

  const submitProposal = useSubmitProposal({
    answer: proposalValueComputed,
    request: request?.id!,
  });

  const {
    data: proposal,
    isLoading: isLoadingProposal,
    refetch: refetchProposal,
  } = useGetProposal({
    requestId: request?.id!,
  });

  // either current user stats if not proposed or proposer stats
  const { data: proposer } = useUserProposer(
    proposal && proposal.timestamp > 0 ? proposal.proposer : accountAddress!
  );

  const handleSubmitProposal = useCallback(() => {
    if (!request) return;
    submitProposal.initiate();
  }, [
    request,
    submitProposal.execute.isEnabled,
    submitProposal.execute.isReady,
  ]);

  useEffect(() => {
    if (!request) return;
    switch (request.answerType) {
      case 0:
        const isBool = isBoolean(proposalValue);
        setProposalValueValid(isBool);
        setProposalValueComputed(
          isBool ? toHex(proposalValue, { size: 32 }) : undefined
        );
        break;
      case 1:
        setProposalValueValid(isNumber(proposalValue));
        break;
    }
  }, [proposalValue, request]);

  useEffect(() => {
    if (submitProposal.execute.execution.isSuccess) {
      refetch();
      refetchProposal();
    }
  }, [submitProposal.execute.execution.isSuccess]);

  return (
    <div className="grid grid-cols-4 gap-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6 group border-l-4 border-l-blue-200! col-span-4 md:col-span-3">
        {isLoading ? (
          <div className="flex flex-row justify-center items-center h-full">
            <Loader size={48} />
          </div>
        ) : request ? (
          <div className="flex flex-col gap-4 col-span-3">
            {/* HEADLINE */}
            <div className="flex flex-row w-full justify-between">
              <div className="text-xl block font-bold">
                Request is waiting for proposal
                <span className="text-sm block text-gray-400">
                  Request ID: {request?.id}
                </span>
              </div>
              <div>
                <span className="bg-blue-200 px-4 py-2 rounded-full text-blue-600 font-bold">
                  {getReadableRequestStatus(
                    proposal && proposal.timestamp > 0 ? 2 : request.status
                  )}
                </span>
              </div>
            </div>

            <hr className="border-0 border-t border-t-gray-300" />

            {/* REQUEST DETAILS */}
            <RequestDetails request={request} />

            <hr className="border-0 border-t border-t-gray-300" />

            {/* ACTIONS */}
            {isLoadingProposal && <span>Load proposal</span>}
            {!isLoadingProposal &&
              (proposal && proposal.timestamp > 0 ? (
                <div className="flex flex-col w-full gap-2">
                  <div className="text-xl block font-bold">
                    {accountAddress && accountAddress == proposal.proposer
                      ? "Your proposed answer"
                      : "The proposed answer"}
                  </div>
                  <div className="text-xl block font-bold">
                    {request.answerType === 0 && (
                      <SolverBool
                        disabled={true}
                        value={hexToBool(proposal.answer, { size: 32 })}
                        onChange={() => {}}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {isSameAddress(request.requester.id, accountAddress) ? (
                    <ColoredTile color="red">
                      You're not allowed to propose an answer to your own
                      request
                    </ColoredTile>
                  ) : (
                    <>
                      <div className="flex flex-col w-full gap-2">
                        <div className="text-xl block font-bold">
                          Submit your proposal
                        </div>
                        <div>
                          {/* YES/NO */}
                          {request.answerType === 0 && (
                            <SolverBool
                              value={proposalValue}
                              onChange={setProposalValue}
                            />
                          )}
                          {/* VALLUATION */}
                          {request.answerType === 1 && "VALLUATION"}
                        </div>
                      </div>
                      <Button
                        disabled={
                          !proposalValueValid ||
                          submitProposal.approval.execution.isPending ||
                          submitProposal.execute.execution.isPending
                        }
                        onClick={handleSubmitProposal}
                      >
                        {submitProposal.approval.execution.isPending &&
                          "Confirm approval in your wallet..."}
                        {submitProposal.execute.execution.isPending &&
                          "Confirm proposing answer in your wallet..."}
                        {!submitProposal.approval.execution.isPending &&
                          !submitProposal.execute.execution.isPending &&
                          "Submit proposal"}
                      </Button>
                    </>
                  )}
                </>
              ))}
          </div>
        ) : (
          "invalid request"
        )}
      </div>

      {/* GUIDELINES */}
      <div className="flex flex-col gap-8 col-span-4 md:col-span-1">
        {request && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 group flex flex-col gap-2">
            <div className="text-lg font-bold">Additional Information</div>
            <div>
              <span>Reward:</span> <br />
              <span className="font-bold">
                {formatUnits(BigInt(request.rewardAmount), 6)} USDC
              </span>
            </div>
            <div>
              <span>Bond:</span> <br />
              <span className="font-bold">100 USDC</span>
            </div>
            <div>
              <span>Challenge window:</span> <br />
              <span className="font-bold">
                {(request.challengeWindow / 3600).toLocaleString("en", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
                h
              </span>
            </div>
            {proposal && proposal.timestamp > 0 && (
              <>
                <div>
                  <span>Created:</span> <br />
                  <span className="font-bold">
                    {timeAgo.format(Number(proposal.timestamp) * 1000)}
                  </span>
                </div>
                <div>
                  <span>Resolves unchallenged:</span> <br />
                  <span className="font-bold">
                    {timeAgo.format(
                      (Number(proposal.timestamp) +
                        Number(request.challengeWindow)) *
                        1000
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-lg p-6 group  flex flex-col gap-2">
          <div className="text-lg font-bold">Proposal Guidelines</div>
          <table className="table-auto">
            <tbody>
              {[
                "Sources are credible",
                "Data is current and relevant",
                "Methodology is transparent",
              ].map((item, i) => (
                <tr key={i}>
                  <td className="align-top">
                    <CheckCircle className="size-4 mt-1 text-green-600" />
                  </td>
                  <td className="pl-2">{item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 group flex flex-col gap-2 ">
          <div className="text-lg font-bold">Proposer Stats</div>
          {proposer && (
            <table className="table-auto w-full">
              <tbody>
                <tr>
                  <td className="align-top">Total proposals:</td>
                  <td className="text-right font-bold">
                    {proposer.user.stats.proposals}
                  </td>
                </tr>
                <tr>
                  <td className="align-top">Successful:</td>
                  <td className="text-right font-bold">
                    {proposer.user.stats.successful}
                  </td>
                </tr>
                <tr>
                  <td className="align-top">Active proposals:</td>
                  <td className="text-right font-bold">
                    {proposer.user.stats.proposalsActive}
                  </td>
                </tr>
                <tr>
                  <td className="align-top">Success rate:</td>
                  <td className="text-right font-bold">
                    {proposer.user.stats.successRate}%
                  </td>
                </tr>
                <tr>
                  <td className="align-top">Unchallenged:</td>
                  <td className="text-right font-bold">
                    {proposer.user.stats.proposals -
                      proposer.user.stats.challenged}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
