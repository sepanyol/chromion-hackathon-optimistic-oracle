"use client";

import { Button } from "@/components/Button";
import { ColoredTile } from "@/components/ColoredTile";
import { Loader } from "@/components/Loader";
import { RequestDetails } from "@/components/request-details/RequestDetails";
import { SolverBool } from "@/components/solver/details/SolverBool";
import { useGetReview } from "@/hooks/onchain/useGetReview";
import { useSubmitReview } from "@/hooks/onchain/useSubmitReview";
import { useRequestForReview } from "@/hooks/useRequestForReview";
import { timeAgo } from "@/utils/time-ago";
import { isBoolean } from "lodash";
import { CheckCircle } from "lucide-react";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Address, formatUnits, hexToBool, hexToString, toHex } from "viem";
import { useAccount } from "wagmi";
import { ReviewSelector } from "./ReviewSelector";
import { isSameAddress } from "@/utils/addresses";
import { ReviewBar } from "../ReviewBar";

type ReviewChallengeDetailsProps = { requestId: Address };
export const ReviewChallengeDetails = ({
  requestId,
}: ReviewChallengeDetailsProps) => {
  const [supportChallenge, setSupportChallenge] = useState<boolean | null>(
    null
  );
  const [reason, setReason] = useState<string>();
  const [reasonBytes, setReasonBytes] = useState<string>();
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);

  const { address: accountAddress } = useAccount();

  const { data: request, isLoading, refetch } = useRequestForReview(requestId);

  const userReview = useGetReview({
    requestId: request?.id!,
    reviewer: accountAddress!,
  });

  const submitReview = useSubmitReview({
    request: request?.id!,
    reason: reasonBytes!,
    supportChallenge: supportChallenge,
  });

  const handleSubmitReview = useCallback(() => {
    if (
      !request ||
      !submitReview.execute.isEnabled ||
      !submitReview.execute.isReady
    )
      return;
    submitReview.initiate();
  }, [request, submitReview.execute.isEnabled, submitReview.execute.isReady]);

  useEffect(() => {
    if (!submitReview.execute.execution.isSuccess) return;
    refetch();
    userReview.refetch();
    // refetchChallenge();
  }, [submitReview.execute.execution.isSuccess, userReview]);

  useEffect(() => {
    if (!request) return;
    setReasonBytes(reason ? toHex(reason) : toHex(""));
    setEnableSubmit(
      Boolean(reason && isBoolean(supportChallenge) && reason.length > 0)
    );
  }, [reason, supportChallenge, request]);

  useEffect(() => {
    if (userReview.isLoading || !userReview.isSuccess) return;
    setIsReviewed(userReview.data.timestamp > 0);
  }, [userReview.isSuccess, userReview.isLoading]);

  if (isLoading) return <Loader size={48} />;

  return (
    <div className="grid grid-cols-4 gap-8">
      <div className="col-span-4 md:col-span-3">
        <div className="bg-white border border-gray-200 rounded-lg p-6 group ">
          {isLoading ? (
            <div className="flex flex-row justify-center items-center h-full">
              <Loader size={48} />
            </div>
          ) : request ? (
            <div className="flex flex-col gap-4 col-span-3">
              {/* HEADLINE */}
              <div className="flex flex-row w-full justify-between">
                <div className="text-xl block font-bold">
                  Review this request and vote
                  <span className="text-sm block text-gray-400">
                    Request ID: {request?.id}
                  </span>
                </div>
              </div>

              <hr className="border-0 border-t border-t-gray-300" />

              {/* REQUEST DETAILS */}
              <RequestDetails request={request} />

              <hr className="border-0 border-t border-t-gray-300" />

              {/* proposer answer */}
              <div className="flex flex-col w-full gap-2 relative">
                {isBoolean(supportChallenge) && !supportChallenge && (
                  <div className="-inset-2 z-0 absolute bg-green-600/10 border border-green-600/20 rounded-lg"></div>
                )}
                <div className="text-xl block font-bold">Answer proposed</div>
                <div>
                  {request.answerType === 0 && (
                    <SolverBool
                      disabled={true}
                      value={hexToBool(request.proposal.answer as Address, {
                        size: 32,
                      })}
                      onChange={() => {}}
                    />
                  )}
                  {request.answerType === 1 && "VALUATION"}
                </div>
              </div>

              <hr className="border-0 border-t border-t-gray-300" />

              {/* challenger answer */}
              <div className="flex flex-col w-full gap-2 relative">
                {isBoolean(supportChallenge) && supportChallenge && (
                  <div className="-inset-2 z-0 absolute bg-green-600/10 border border-green-600/20 rounded-lg"></div>
                )}
                <div className="text-xl block font-bold">Answer challenged</div>
                <div>
                  {request.answerType === 0 && (
                    <SolverBool
                      disabled={true}
                      value={hexToBool(request.challenge.answer as Address, {
                        size: 32,
                      })}
                      onChange={() => {}}
                    />
                  )}
                  {request.answerType === 1 && "VALUATION"}
                </div>
              </div>

              <hr className="border-0 border-t border-t-gray-300" />

              {/* Vote for Proposer or Challenger */}
              {userReview.isLoading || userReview.isFetching ? (
                <div className="flex flex-col w-full gap-2">
                  <Loader />
                </div>
              ) : isSameAddress(request.requester.id, accountAddress) ? (
                <ColoredTile color="red">
                  You're not allowed to vote on your own request
                </ColoredTile>
              ) : request.proposal &&
                isSameAddress(request.proposal.proposer.id, accountAddress) ? (
                <ColoredTile color="red">
                  You're not allowed to vote on your own proposal
                </ColoredTile>
              ) : request.challenge &&
                isSameAddress(
                  request.challenge.challenger.id,
                  accountAddress
                ) ? (
                <ColoredTile color="red">
                  You're not allowed to vote on your own challenge
                </ColoredTile>
              ) : (
                <>
                  <div className="flex flex-col w-full gap-2">
                    <div className="text-xl block font-bold">
                      {isReviewed ? "Your Vote" : "Voting"}
                    </div>
                    <div>
                      <ReviewSelector
                        disabled={isReviewed}
                        value={
                          !isReviewed
                            ? supportChallenge
                            : userReview.data?.supportsChallenge!
                        }
                        onChange={setSupportChallenge}
                      />
                    </div>
                    {isReviewed ? (
                      <>
                        <div className="text-xl block font-bold">
                          Your reason
                        </div>
                        <ColoredTile>
                          {hexToString(userReview.data?.reason as Address)}
                        </ColoredTile>
                      </>
                    ) : (
                      <>
                        <div className="text-xl block font-bold">Reason</div>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.currentTarget.value)}
                          placeholder="e.g. I'm supporting the proposer, because he's right..."
                          rows={3}
                          className="w-full px-3 py-2 border placeholder:text-gray-400 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-gray-300"
                        />
                      </>
                    )}
                  </div>
                  {!isReviewed && (
                    <Button
                      disabled={
                        !enableSubmit ||
                        submitReview.approval.execution.isPending ||
                        submitReview.execute.execution.isPending
                      }
                      onClick={handleSubmitReview}
                    >
                      {submitReview.approval.execution.isPending &&
                        "Confirm approval in your wallet..."}
                      {submitReview.execute.execution.isPending &&
                        "Confirm review in your wallet..."}
                      {!submitReview.approval.execution.isPending &&
                        !submitReview.execute.execution.isPending &&
                        "Submit review"}
                    </Button>
                  )}
                </>
              )}

              <hr className="border-0 border-t border-t-gray-300" />
              <div className="flex flex-col w-full gap-2">
                <div className="text-xl block font-bold">Supporter Balance</div>
                <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                  {Number(request.challenge.votesFor) +
                    Number(request.challenge.votesAgainst) ===
                  0 ? (
                    "No supporters yet. Be the first!"
                  ) : (
                    <ReviewBar
                      challengeVotes={request.challenge.votesFor}
                      proposalVotes={request.challenge.votesAgainst}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            "invalid request"
          )}
        </div>
      </div>

      {/* GUIDELINES */}
      <div className="flex flex-col gap-8 col-span-4 md:col-span-1">
        {request && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 group flex flex-col gap-2">
            <div className="text-lg font-bold">Additional Information</div>
            <div>
              <span>Request Reward:</span> <br />
              <span className="font-bold">
                {formatUnits(BigInt(request.rewardAmount), 6)} USDC
              </span>
            </div>
            <div>
              <span>Proposer Bond:</span> <br />
              <span className="font-bold">
                {formatUnits(BigInt(1e8), 6)} USDC
              </span>
            </div>
            <div>
              <span>Challenger Bond:</span> <br />
              <span className="font-bold">
                {formatUnits(BigInt(1e8), 6)} USDC
              </span>
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
            <div>
              <span>Challenged:</span> <br />
              <span className="font-bold">
                {timeAgo.format(Number(request.challenge.createdAt) * 1000)}
              </span>
            </div>
            <div>
              <span>Review Period:</span> <br />
              <span className="font-bold">
                {(24).toLocaleString("en", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
                h
              </span>
            </div>
            <div>
              <span>Review ends:</span> <br />
              <span className="font-bold">
                {/* TODO implement proper challenge end date. Get general oracle data on start and use it, or store on request or in challenge */}
                {timeAgo.format(
                  (Number(request.challenge.createdAt) + 86400) * 1000
                )}
              </span>
            </div>
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-lg p-6 group  flex flex-col gap-2">
          <div className="text-lg font-bold">Reviewer Guidelines</div>
          <table className="table-auto">
            <tbody>
              {[
                "Sources are credible",
                "Data is current and relevant",
                "Methodology is transparent",
                "Proposer reason is clear and comprehensible",
                "Challenger reason is clear and comprehensible",
                "Don't be biased by other reviewes",
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
        {request && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 group flex flex-col gap-2 ">
            <div className="text-lg font-bold">Recent Reviews</div>
            <div>
              <table className="table-auto w-full">
                <tbody>
                  {request.reviews &&
                    request.reviews.map((review, i) => (
                      <Fragment key={`review${i}`}>
                        <tr>
                          <td className="py-1">
                            {review.supportsChallenge ? (
                              <span className="px-2 py-1 font-bold border border-purple-400 bg-purple-100 rounded-lg text-xs uppercase">
                                FOR CHALLENGER
                              </span>
                            ) : (
                              <span className="px-2 py-1 font-bold border  border-blue-400 bg-blue-100 rounded-lg text-xs uppercase">
                                FOR PROPOSER
                              </span>
                            )}
                          </td>
                          <td className="text-xs text-right text-gray-500">
                            {timeAgo.format(Number(review.createdAt) * 1000)}
                          </td>
                        </tr>
                      </Fragment>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
