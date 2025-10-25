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
  Abi,
  Address,
  formatUnits,
  hexToBigInt,
  hexToBool,
  hexToString,
  isHex,
  parseUnits,
  toHex,
} from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
// import { SolverBool } from "./SolverBool";
import oracleAbi from "@/abis/coordinator.json";
import { ColoredTile } from "@/components/ColoredTile";
import { RequestContext } from "@/components/RequestProvider";
import { SolverBool } from "@/components/solver/details/SolverBool";
import { SolverValue } from "@/components/solver/details/SolverValue";
import { useExecuteFunction } from "@/hooks/onchain/useExecuteFunction";
import { useGetChallenge } from "@/hooks/onchain/useGetChallenge";
import { useTokenApproval } from "@/hooks/onchain/useTokenApproval";
import { useRequestForChallenge } from "@/hooks/useRequestForChallenge";
import { isSameAddress } from "@/utils/addresses";
import { defaultChain } from "@/utils/appkit/context";
import { getOracleByChainId, getUSDCByChainId } from "@/utils/contracts";
import { CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

export const ChallengerRequestDetails = () => {
  const tokenAddress = getUSDCByChainId(defaultChain.id);
  const oracleAddress = getOracleByChainId(defaultChain.id);

  const { requestId } = useContext(RequestContext);
  const [challengeValue, setChallengeValue] = useState<any>(null);
  const [challengeValueComputed, setChallengeValueComputed] =
    useState<any>(null);
  const [reason, setReason] = useState<string>();
  const [reasonBytes, setReasonBytes] = useState<string>();
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [txHashApproval, setTxHashApproval] = useState<Address | undefined>();
  const [txHashPropose, setTxHashPropose] = useState<Address | undefined>();

  const { address: accountAddress, chainId } = useAccount();

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

  const approval = useTokenApproval({
    address: tokenAddress,
    spender: oracleAddress!,
    amount: BigInt(100e6),
    chainId: chainId!,
  });

  const waitForApproval = useWaitForTransactionReceipt({
    hash: txHashApproval,
    query: { enabled: !!txHashApproval },
  });

  const execute = useExecuteFunction({
    abi: oracleAbi as Abi,
    address: oracleAddress!,
    functionName: "challengeAnswer",
    args: [requestId, true, challengeValueComputed, reasonBytes],
    chainId: chainId!,
    eventNames: ["ChallengeSubmitted"],
    enabled:
      isHex(requestId) && isHex(challengeValueComputed) && isHex(reasonBytes),
  });

  const waitForProposal = useWaitForTransactionReceipt({
    hash: txHashPropose,
    query: { enabled: !!txHashPropose },
  });

  const handleSubmitChallenge = useCallback(() => {
    if (!request || !approval.isReady || !approval.isEnabled) {
      console.log("error handleSubmitChallenge");
      return;
    }
    approval.write();
  }, [request, approval.isReady, approval.isEnabled]);

  useEffect(() => {
    if (!approval.hash) return;
    setTxHashApproval(approval.hash);
  }, [approval.hash]);

  useEffect(() => {
    if (!execute.isEnabled || !execute.isReady || !waitForApproval.isSuccess)
      return;

    if (waitForApproval.isSuccess) {
      setTxHashApproval(undefined);
      console.log("lets go");
      execute.write();
    }
  }, [execute.isEnabled, execute.isReady, waitForApproval.isSuccess]);

  useEffect(() => {
    if (!execute.hash) return;
    setTxHashPropose(execute.hash);
  }, [execute.hash]);

  useEffect(() => {
    if (!waitForProposal.isSuccess) return;

    setTxHashPropose(undefined);
    refetch();
    refetchChallenge();
    toast.success("Successfully challenged answer");
  }, [waitForProposal.isSuccess]);

  useEffect(() => {
    if (!request) return;
    // set default, once request is loaded
    if (request.answerType == 0) {
      setChallengeValue(
        !hexToBool(request.proposal.answer as Address, {
          size: 32,
        })
      );
    }
  }, [request]);

  useEffect(() => {
    if (!request) return;

    // when reason changes, check over all status
    setReasonBytes(reason ? toHex(reason) : toHex(""));
    setEnableSubmit(
      Boolean(
        reason &&
          reason.length > 0 &&
          request.proposal.answer != challengeValueComputed
      )
    );
  }, [request, reason, challengeValueComputed]);

  useEffect(() => {
    if (!request) return;

    if (!challengeValue) {
      setChallengeValueComputed(null);
      return;
    }

    if (request.answerType === 0) {
      setChallengeValueComputed(toHex(challengeValue, { size: 32 }));
    }

    if (request.answerType === 1) {
      setChallengeValueComputed(
        toHex(parseUnits(challengeValue, 6), {
          size: 32,
        })
      );
    }
  }, [request, challengeValue]);

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
                  {request.answerType === 1 && (
                    <SolverValue
                      disabled={true}
                      value={formatUnits(
                        hexToBigInt(request.proposal.answer as Address, {
                          size: 32,
                        }),
                        6
                      )}
                      onChange={() => {}}
                    />
                  )}
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
                      {request.answerType === 1 && (
                        <SolverValue
                          disabled={true}
                          value={formatUnits(
                            hexToBigInt(challenge.answer as Address, {
                              size: 32,
                            }),
                            6
                          )}
                          onChange={() => {}}
                        />
                      )}
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
                            {request.answerType === 1 && (
                              <SolverValue
                                error={
                                  request.proposal.answer ==
                                  challengeValueComputed
                                    ? "Same value not allowed"
                                    : ""
                                }
                                value={challengeValue}
                                onChange={setChallengeValue}
                              />
                            )}
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
                            waitForApproval.isLoading ||
                            waitForProposal.isLoading ||
                            approval.execution.isPending ||
                            execute.execution.isPending
                          }
                          onClick={handleSubmitChallenge}
                        >
                          {approval.execution.isPending &&
                            "Confirm approval in your wallet..."}
                          {execute.execution.isPending &&
                            "Confirm challenging proposal in your wallet..."}
                          {(waitForApproval.isLoading ||
                            waitForProposal.isLoading) &&
                            "Finishing transaction..."}
                          {!waitForApproval.isLoading &&
                            !waitForProposal.isLoading &&
                            !approval.execution.isPending &&
                            !execute.execution.isPending &&
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
