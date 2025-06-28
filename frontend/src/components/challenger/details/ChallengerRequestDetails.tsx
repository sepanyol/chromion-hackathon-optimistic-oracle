"use client";

import { Button } from "@/components/Button";
import { Loader } from "@/components/Loader";
import { RequestDetails } from "@/components/request-details/RequestDetails";
import {
  getReadableRequestStatus,
  getReadableRequestStatusForOpposition,
} from "@/utils/helpers";
import { timeAgo } from "@/utils/time-ago";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  Address,
  formatUnits,
  hexToBool,
  hexToString,
  toHex,
  WaitForTransactionReceiptErrorType,
} from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
// import { SolverBool } from "./SolverBool";
import { ColoredTile } from "@/components/ColoredTile";
import { RequestContext } from "@/components/RequestProvider";
import { SolverBool } from "@/components/solver/details/SolverBool";
import { useGetChallenge } from "@/hooks/onchain/useGetChallenge";
import { useSubmitChallenge } from "@/hooks/onchain/useSubmitChallenge";
import { useRequestForChallenge } from "@/hooks/useRequestForChallenge";
import { isSameAddress } from "@/utils/addresses";
import { CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

export const ChallengerRequestDetails = () => {
  const { requestId } = useContext(RequestContext);
  const [challengeValue, setChallengeValue] = useState<any>(null);
  const [reason, setReason] = useState<string>();
  const [reasonBytes, setReasonBytes] = useState<string>();
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [txHash, setTxHash] = useState<Address | undefined>();

  const { address: accountAddress } = useAccount();

  const {
    data: request,
    isLoading,
    refetch,
  } = useRequestForChallenge(requestId);

  const {
    data: challenge,
    isLoading: isLoadingChallenge,
    refetch: refetchChallenge,
  } = useGetChallenge({
    requestId,
  });

  const submitChallenge = useSubmitChallenge({
    request: requestId,
    answer: request
      ? toHex(
          !hexToBool(request?.proposal.answer as Address, {
            size: 32,
          }),
          { size: 32 }
        )
      : undefined,
    reason: reasonBytes,
  });

  // either current user stats if not proposed or proposer stats
  // const { data: challenger } = useUserChallenger(
  //   challenge && challenge.timestamp > 0
  //     ? challenge.challenger
  //     : accountAddress!
  // );

  const handleSubmitChallenge = useCallback(() => {
    if (
      !request ||
      !submitChallenge ||
      !submitChallenge.execute.isEnabled ||
      !submitChallenge.execute.isReady
    )
      return;

    submitChallenge.initiate();
  }, [request, submitChallenge]);

  useEffect(() => {
    if (!submitChallenge.execute.execution.isSuccess) return;
    setTxHash(submitChallenge.execute.hash);
  }, [refetch, refetchChallenge, submitChallenge.execute.execution.isSuccess]);

  useEffect(() => {
    if (!request || !challenge) return;
    switch (request.answerType) {
      case 0:
        setChallengeValue(
          !hexToBool(request.proposal.answer as Address, {
            size: 32,
          })
        );
        break;
      case 1:
        break;
    }
    setReasonBytes(reason ? toHex(reason) : toHex(""));
    setEnableSubmit(Boolean(reason && reason.length > 0));
  }, [challenge, reason, request]);

  const {
    data: dataTx,
    isLoading: isLoadingTx,
    isSuccess: isSuccessTx,
    error: errorTx,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  useEffect(() => {
    if (!isSuccessTx || isLoadingTx) return;

    if (errorTx)
      toast.error((errorTx as WaitForTransactionReceiptErrorType).message);

    if (dataTx) {
      refetch();
      refetchChallenge();
      toast.success("Successfully challenged answer");
    }
  }, [dataTx, isLoadingTx, isSuccessTx, errorTx]);

  if (isLoading || isLoadingChallenge) return <Loader />;

  return (
    <div className="grid grid-cols-4 gap-8">
      <div className="col-span-4 md:col-span-3">
        <div className="bg-white border border-gray-200 rounded-lg p-6 group border-l-4 border-l-blue-200! ">
          {isLoading ? (
            <div className="flex flex-row justify-center items-center h-full">
              <Loader size={48} />
            </div>
          ) : request ? (
            <div className="flex flex-col gap-4 col-span-3">
              {/* HEADLINE */}
              <div className="flex flex-row w-full justify-between">
                <div className="text-xl block font-bold">
                  Answer wait to get challenged
                  <span className="text-sm block text-gray-400">
                    Request ID: {request?.id}
                  </span>
                </div>
                <div>
                  <span className="bg-blue-200 px-4 py-2 rounded-full text-blue-600 font-bold">
                    {challenge && challenge.timestamp > 0
                      ? getReadableRequestStatus(3)
                      : getReadableRequestStatusForOpposition(2)}
                  </span>
                </div>
              </div>

              <hr className="border-0 border-t border-t-gray-300" />

              {/* REQUEST DETAILS */}
              <RequestDetails request={request} />

              <hr className="border-0 border-t border-t-gray-300" />

              {/* Current proposed answer */}
              <div className="flex flex-col w-full gap-2">
                <div className="text-xl block font-bold">Proposed answer</div>
                <div className="text-xl block font-bold">
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

              {/* ACTIONS */}
              {isLoadingChallenge && <span>Load challenge</span>}
              {!isLoadingChallenge &&
                (challenge && challenge.timestamp > 0 ? (
                  <div className="flex flex-col w-full gap-2">
                    <div className="text-xl block font-bold">
                      {accountAddress && accountAddress == challenge.challenger
                        ? "Your challenging answer"
                        : "The challenging answer"}
                    </div>
                    <div className="text-xl block font-bold">
                      {request.answerType === 0 && (
                        <SolverBool
                          disabled={true}
                          value={hexToBool(challenge.answer as Address, {
                            size: 32,
                          })}
                          onChange={() => {}}
                        />
                      )}
                      {request.answerType === 1 && "VALUATION"}
                    </div>
                    <div className="text-xl block font-bold">
                      Challenge Reason
                    </div>
                    <ColoredTile>
                      {hexToString(challenge.reason as Address)}
                    </ColoredTile>
                  </div>
                ) : (
                  <>
                    {isSameAddress(request.requester.id, accountAddress) ? (
                      <ColoredTile color="red">
                        You&apos;re not allowed to challenge a proposed answer
                        for your own request
                      </ColoredTile>
                    ) : request.proposal &&
                      isSameAddress(
                        request.proposal.proposer.id,
                        accountAddress
                      ) ? (
                      <ColoredTile color="red">
                        You&apos;re not allowed to challenge your own answer
                      </ColoredTile>
                    ) : (
                      <>
                        <div className="flex flex-col w-full gap-2">
                          <div className="text-xl block font-bold">
                            Challenge the proposed answer
                          </div>
                          <div>
                            {/* YES/NO */}
                            {request.answerType === 0 && (
                              <SolverBool
                                disabled={true}
                                value={challengeValue}
                                onChange={() => {}}
                              />
                            )}
                            {/* VALLUATION */}
                            {request.answerType === 1 && "VALUATION"}
                          </div>
                          <div className="text-xl block font-bold">
                            Challenge Reason
                          </div>
                          <textarea
                            value={reason}
                            onChange={(e) => setReason(e.currentTarget.value)}
                            placeholder="e.g., the proposed answer is not true, if you look at..."
                            rows={3}
                            className="w-full px-3 py-2 border placeholder:text-gray-400 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-gray-300"
                          />
                        </div>
                        <Button
                          disabled={
                            !enableSubmit ||
                            isLoadingTx ||
                            submitChallenge.approval.execution.isPending ||
                            submitChallenge.execute.execution.isPending
                          }
                          onClick={handleSubmitChallenge}
                        >
                          {submitChallenge.approval.execution.isPending &&
                            "Confirm approval in your wallet..."}
                          {submitChallenge.execute.execution.isPending &&
                            "Confirm proposing answer in your wallet..."}
                          {isLoadingTx && "Finishing transaction..."}
                          {!isLoadingTx &&
                            !submitChallenge.approval.execution.isPending &&
                            !submitChallenge.execute.execution.isPending &&
                            "Submit challenge"}
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
      </div>

      {/* GUIDELINES */}
      <div className="flex flex-col gap-8 col-span-4 md:col-span-1">
        {request && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 group flex flex-col gap-2">
            <div className="text-lg font-bold">Additional Information</div>
            <div>
              <span>Reward (+ Proposer Bond):</span> <br />
              <span className="font-bold">
                {formatUnits(BigInt(request.rewardAmount) + BigInt(1e8), 6)}{" "}
                USDC
              </span>
            </div>
            <div>
              <span>Bonding:</span> <br />
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
            {challenge && challenge.timestamp > 0 && (
              <>
                <div>
                  <span>Created:</span> <br />
                  <span className="font-bold">
                    {timeAgo.format(Number(challenge.timestamp) * 1000)}
                  </span>
                </div>
                <div>
                  <span>Challenge ends:</span> <br />
                  <span className="font-bold">
                    {/* TODO implement proper challenge end date. Get general oracle data on start and use it, or store on request or in challenge */}
                    {timeAgo.format(
                      (Number(challenge.timestamp) + 86400) * 1000
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-lg p-6 group  flex flex-col gap-2">
          <div className="text-lg font-bold">Challenge Guidelines</div>
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
          {/* challenger && (
            <table className="table-auto w-full">
              <tbody>
                <tr>
                  <td className="align-top">Total challenges:</td>
                  <td className="text-right font-bold">
                    {challenger.user.stats.challenges}
                  </td>
                </tr>
                <tr>
                  <td className="align-top">Successful:</td>
                  <td className="text-right font-bold">
                    {challenger.user.stats.successful}
                  </td>
                </tr>
                <tr>
                  <td className="align-top">Active challenges:</td>
                  <td className="text-right font-bold">
                    {challenger.user.stats.challengesActive}
                  </td>
                </tr>
                <tr>
                  <td className="align-top">Success rate:</td>
                  <td className="text-right font-bold">
                    {challenger.user.stats.successRate}%
                  </td>
                </tr>
                <tr>
                  <td className="align-top">Unchallenged:</td>
                  <td className="text-right font-bold">
                    {challenger.user.stats.challenges -
                      challenger.user.stats.challenged}
                  </td>
                </tr>
              </tbody>
            </table>
          )*/}
        </div>
      </div>
    </div>
  );
};
