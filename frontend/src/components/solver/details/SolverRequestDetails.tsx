"use client";
import oracleAbi from "@/abis/coordinator.json";
import { Button } from "@/components/Button";
import { ColoredTile } from "@/components/ColoredTile";
import { Loader } from "@/components/Loader";
import { RequestDetails } from "@/components/request-details/RequestDetails";
import { useRequestContext } from "@/components/RequestProvider";
import { useExecuteFunction } from "@/hooks/onchain/useExecuteFunction";
import { useGetProposal } from "@/hooks/onchain/useGetProposal";
import { useTokenApproval } from "@/hooks/onchain/useTokenApproval";
import { useRequestForProposal } from "@/hooks/useRequestForProposal";
import { useUserProposer } from "@/hooks/useUserProposer";
import { isSameAddress } from "@/utils/addresses";
import { defaultChain } from "@/utils/appkit/context";
import { getOracleByChainId, getUSDCByChainId } from "@/utils/contracts";
import { getReadableRequestStatus } from "@/utils/helpers";
import { timeAgo } from "@/utils/time-ago";
import { isBoolean, isUndefined } from "lodash";
import { CheckCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Abi,
  Address,
  formatUnits,
  hexToBigInt,
  hexToBool,
  isHex,
  parseUnits,
  toHex,
  TransactionExecutionError,
} from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { SolverBool } from "./SolverBool";
import { SolverValue } from "./SolverValue";

export const SolverRequestDetails = () => {
  const { requestId } = useRequestContext();
  const { address: accountAddress, chainId } = useAccount();

  const [proposalValue, setProposalValue] = useState<any>(null);
  const [proposalValueComputed, setProposalValueComputed] = useState<string>();
  const [proposalValueValid, setProposalValueValid] = useState(false);
  const [txHashApproval, setTxHashApproval] = useState<Address | undefined>();
  const [txHashPropose, setTxHashPropose] = useState<Address | undefined>();

  const {
    data: proposal,
    isLoading: isLoadingProposal,
    isFetching: isFetchingProposal,
    refetch: refetchProposal,
  } = useGetProposal({
    requestId: requestId,
  });

  const { data: proposer } = useUserProposer(
    proposal ? proposal.proposer : accountAddress!
  );

  const {
    data: request,
    isLoading,
    isFetching,
    refetch,
  } = useRequestForProposal(requestId);

  const tokenAddress = getUSDCByChainId(defaultChain.id);
  const oracleAddress = getOracleByChainId(defaultChain.id);

  const approval = useTokenApproval({
    address: tokenAddress,
    spender: oracleAddress!,
    amount: BigInt(parseUnits("100", 6)),
    chainId: chainId!,
  });

  const waitForApproval = useWaitForTransactionReceipt({
    hash: txHashApproval,
    query: { enabled: !!txHashApproval },
  });

  const execute = useExecuteFunction({
    abi: oracleAbi as Abi,
    address: oracleAddress!,
    functionName: "proposeAnswer",
    args: [requestId, proposalValueComputed],
    chainId: chainId!,
    eventNames: ["AnswerProposed"],
    enabled: isHex(requestId) && isHex(proposalValueComputed),
  });

  const waitForProposal = useWaitForTransactionReceipt({
    hash: txHashPropose,
    query: { enabled: !!txHashPropose },
  });

  useEffect(() => {
    if (request && !isUndefined(proposalValue)) {
      switch (request.answerType) {
        case 0:
          const _isBool = isBoolean(proposalValue);
          setProposalValueValid(_isBool);
          setProposalValueComputed(
            _isBool ? toHex(proposalValue, { size: 32 }) : undefined
          );
          break;
        case 1:
          const _isNumber =
            proposalValue &&
            !!proposalValue.trim() &&
            isFinite(Number(proposalValue.trim()));
          setProposalValueValid(_isNumber);
          setProposalValueComputed(
            _isNumber
              ? toHex(parseUnits(proposalValue.trim(), 6), { size: 32 })
              : undefined
          );
          break;
      }
    }
    return () => {
      setProposalValueComputed(undefined);
      setProposalValueValid(false);
    };
  }, [proposalValue]);

  const handleSubmitProposal = useCallback(() => {
    if (!request || !approval.isReady || !approval.isEnabled) {
      console.log("error handleSubmitProposal");
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
    refetchProposal();
    toast.success("Successfully proposed an answer");
  }, [waitForProposal.isSuccess]);

  useEffect(() => {
    if (!approval.execution.error) return;
    toast.error(
      `Error: ${
        (approval.execution.error as TransactionExecutionError).shortMessage
      }`
    );
  }, [approval.execution.error]);

  useEffect(() => {
    if (!execute.execution.error) return;
    toast.error(
      `Error: ${
        (execute.execution.error as TransactionExecutionError).shortMessage
      }`
    );
  }, [execute.execution.error]);

  return (
    <div className="grid grid-cols-4 gap-8">
      <div className="col-span-4 md:col-span-3">
        <div className="bg-white border border-gray-200 rounded-lg p-6 group border-l-4 border-l-blue-200!">
          {isLoading || isFetching ? (
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
              {(isLoadingProposal || isFetchingProposal) && (
                <span>Load proposal</span>
              )}
              {!isLoadingProposal &&
                !isFetchingProposal &&
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
                      {request.answerType === 1 && (
                        <SolverValue
                          disabled={true}
                          value={formatUnits(
                            hexToBigInt(proposal.answer, { size: 32 }),
                            6
                          )}
                          onChange={setProposalValue}
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
                            {request.answerType === 1 && (
                              <SolverValue
                                value={proposalValue}
                                onChange={setProposalValue}
                              />
                            )}
                          </div>
                        </div>
                        <Button
                          disabled={
                            !proposalValueValid ||
                            waitForApproval.isLoading ||
                            waitForProposal.isLoading ||
                            approval.execution.isPending ||
                            execute.execution.isPending
                          }
                          onClick={handleSubmitProposal}
                          className="flex gap-2"
                        >
                          {approval.execution.isPending &&
                            "Confirm approval in your wallet..."}
                          {execute.execution.isPending &&
                            "Confirm proposing answer in your wallet..."}
                          {(waitForApproval.isLoading ||
                            waitForProposal.isLoading) &&
                            "Finishing transaction..."}
                          {!waitForApproval.isLoading &&
                            !waitForProposal.isLoading &&
                            !approval.execution.isPending &&
                            !execute.execution.isPending &&
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
          {proposer && proposer.user && (
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
