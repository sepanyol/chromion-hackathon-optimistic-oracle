"use client";
import oracleAbi from "@/abis/coordinator.json";
import { Button } from "@/components/Button";
import { ColoredTile } from "@/components/ColoredTile";
import { Loader } from "@/components/Loader";
import { RequestDetails } from "@/components/request-details/RequestDetails";
import { useRequestContext } from "@/components/RequestProvider";
import { useGetProposal } from "@/hooks/onchain/useGetProposal";
import { useRequestForProposal } from "@/hooks/useRequestForProposal";
import { useUserProposer } from "@/hooks/useUserProposer";
import { isSameAddress } from "@/utils/addresses";
import { defaultChain } from "@/utils/appkit/context";
import { getOracleByChainId, getUSDCByChainId } from "@/utils/contracts";
import { getReadableRequestStatus } from "@/utils/helpers";
import { timeAgo } from "@/utils/time-ago";
import {
  useEvmClients,
  useEvmTransactionFlow,
} from "@s3panyol/use-evm-transaction-flow";
import { isBoolean, isUndefined } from "lodash";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Abi,
  formatUnits,
  hexToBigInt,
  hexToBool,
  parseUnits,
  toHex,
} from "viem";
import { SolverBool } from "./SolverBool";
import { SolverValue } from "./SolverValue";
import { useOracleContext } from "@/components/OracleProvider";

export const SolverRequestDetails = () => {
  const { assetDecimals, proposerBond, isOracleLoaded } = useOracleContext();
  const { requestId } = useRequestContext();
  const { account: accountAddress, isConnected } = useEvmClients();

  const [proposalValue, setProposalValue] = useState<any>(null);
  const [proposalValueComputed, setProposalValueComputed] = useState<string>();
  const [proposalValueValid, setProposalValueValid] = useState(false);

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

  const oracleAddress = getOracleByChainId(defaultChain.id);
  const proposeAnswer = useEvmTransactionFlow({
    abi: oracleAbi as Abi,
    args: [requestId, proposalValueComputed],
    contractAddress: oracleAddress!,
    functionName: "proposeAnswer",
    tokenAddress: getUSDCByChainId(defaultChain.id),
    tokenType: "ERC20",
    amount: proposerBond!,
    spender: oracleAddress,
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
              ? toHex(parseUnits(proposalValue.trim(), assetDecimals!), {
                  size: 32,
                })
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

  const handleSubmitProposal = () => {
    if (!request) {
      console.log("error handleSubmitProposal");
      return;
    }
    proposeAnswer.run();
  };

  useEffect(() => {
    if (!proposeAnswer.isSuccess) return;
    refetch();
    refetchProposal();
    toast.success("Successfully proposed an answer");
  }, [proposeAnswer.isSuccess]);

  useEffect(() => {
    if (!proposeAnswer.isError && !proposeAnswer.error) return;
    toast.error(`Error: ${proposeAnswer.error}`);
  }, [proposeAnswer.error, proposeAnswer.isError]);

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
                            assetDecimals!
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
                            {isConnected
                              ? "Submit your proposal"
                              : "Connect your wallet and submit your proposal"}
                          </div>
                          <div>
                            {/* YES/NO */}
                            {request.answerType === 0 && (
                              <SolverBool
                                disabled={!isConnected}
                                value={proposalValue}
                                onChange={setProposalValue}
                              />
                            )}
                            {/* VALLUATION */}
                            {request.answerType === 1 && (
                              <SolverValue
                                disabled={!isConnected}
                                value={proposalValue}
                                onChange={setProposalValue}
                              />
                            )}
                          </div>
                        </div>
                        <Button
                          disabled={
                            !isConnected ||
                            !proposalValueValid ||
                            proposeAnswer.isExecuting ||
                            proposeAnswer.isWaitingForApproval ||
                            proposeAnswer.isWaitingForApprovalTxConfirmation ||
                            proposeAnswer.isWaitingForExecutionTxConfirmation
                          }
                          onClick={handleSubmitProposal}
                          className="flex gap-2"
                        >
                          {proposeAnswer.isWaitingForApproval &&
                            "Confirm approval in your wallet..."}
                          {proposeAnswer.isExecuting &&
                            "Confirm proposing answer in your wallet..."}
                          {(proposeAnswer.isWaitingForApprovalTxConfirmation ||
                            proposeAnswer.isWaitingForExecutionTxConfirmation) &&
                            "Waiting for transaction..."}
                          {!proposeAnswer.isExecuting &&
                            !proposeAnswer.isWaitingForApproval &&
                            !proposeAnswer.isWaitingForApprovalTxConfirmation &&
                            !proposeAnswer.isWaitingForExecutionTxConfirmation &&
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
                {formatUnits(BigInt(request.rewardAmount), assetDecimals!)} USDC
              </span>
            </div>
            <div>
              <span>Bond:</span> <br />
              <span className="font-bold">
                {formatUnits(proposerBond!, assetDecimals!)} USDC
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
