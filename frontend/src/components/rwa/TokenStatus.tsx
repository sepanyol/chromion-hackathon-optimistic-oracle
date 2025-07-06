import wrapperAbi from "@/abis/wrapper.json";
import { useGetRequestInfo } from "@/hooks/onchain/useGetRequestInfo";
import { getNFTWrapperByChainId, getUSDCByChainId } from "@/utils/contracts";
import {
  useEvmClients,
  useEvmTransactionFlow,
} from "@s3panyol/use-evm-transaction-flow";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Abi, formatUnits } from "viem";
import { Button } from "../Button";
import { Loader } from "../Loader";
import { CreateValuationModal } from "./CreateValuationModal";
import { AcceptPriceModal } from "./AcceptPriceModal";
import { useRequestForReview } from "@/hooks/useRequestForReview";

type TokenStatusProps = { id: bigint };

export const TokenStatus = ({ id }: TokenStatusProps) => {
  const { walletClient } = useEvmClients();
  const getRequestInfo = useGetRequestInfo({ id });
  const wrapperAddress = getNFTWrapperByChainId(walletClient?.chain.id!);
  const rewardAddress = getUSDCByChainId(walletClient?.chain.id!);

  const { data: request } = useRequestForReview(
    getRequestInfo.data && getRequestInfo.data.isResolved
      ? getRequestInfo.data.request
      : undefined!
  );

  const [openModal, setOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [context, setContext] = useState<string | undefined>(undefined);

  const [openModalPrice, setOpenModalPrice] = useState(false);
  const [isSubmittingPrice, setIsSubmittingPrice] = useState(false);

  const evaluate = useEvmTransactionFlow({
    tokenAddress: rewardAddress,
    amount: BigInt(10e6),
    spender: wrapperAddress,
    abi: wrapperAbi as Abi,
    functionName: "evaluate",
    args: [id, context],
    contractAddress: wrapperAddress,
    tokenType: "ERC20",
  });

  // TODO accept price

  useEffect(() => {
    if (isSubmitting && evaluate.isReady) evaluate.run();
  }, [isSubmitting, evaluate.isReady]);

  useEffect(() => {
    if (evaluate.isSuccess) toast.success("Successfully issued a valuation");
  }, [evaluate.isSuccess]);

  // useEffect(() => {
  //   if (isSubmittingPrice) evaluate.run();
  // }, [isSubmittingPrice, evaluate.isReady]);

  if (getRequestInfo.isLoading || getRequestInfo.isFetching) return <></>;

  if (
    (getRequestInfo.data &&
      getRequestInfo.data.request &&
      !getRequestInfo.data.isResolved) ||
    evaluate.isSuccess
  )
    return <span className="italic text-gray-400">pending...</span>;

  if (!getRequestInfo.data || !getRequestInfo.data.isResolved) {
    const disabled =
      evaluate.isExecuting ||
      evaluate.isWaitingForApproval ||
      evaluate.isWaitingForApprovalTxConfirmation ||
      evaluate.isWaitingForExecutionTxConfirmation;
    return (
      <>
        <Button
          disabled={disabled || openModal}
          onClick={() => {
            setOpenModal(true);
          }}
        >
          {disabled || openModal ? (
            <Loader className="text-white!" />
          ) : (
            <span>Evaluate</span>
          )}
        </Button>
        {openModal && (
          <CreateValuationModal
            isSubmitDisabled={isSubmitDisabled}
            isSubmitting={isSubmitting}
            onClose={() => {
              setOpenModal(false);
            }}
            onSubmit={() => {
              setIsSubmitting(true);
            }}
            onUpdate={(value: any) => {
              setContext(value.details.trim());
              setIsSubmitDisabled(value.details.trim().length == 0);
            }}
          />
        )}
      </>
    );
  }

  return !request ? (
    <></>
  ) : (
    <>
      <Button disabled={openModalPrice} onClick={() => setOpenModalPrice(true)}>
        {openModalPrice ? (
          <Loader className="text-white!" />
        ) : (
          <span>Review & Accept</span>
        )}
      </Button>
      {openModalPrice && (
        <AcceptPriceModal
          isSubmitDisabled={false}
          isSubmitting={isSubmittingPrice}
          challengerId={
            request.challenge.challenger
              ? request.challenge.challenger.id
              : null
          }
          price={`${Number(
            formatUnits(BigInt(request.proposal.answer), 6)
          ).toLocaleString(navigator.language, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })} USDC`}
          proposerId={request.proposal.proposer.id}
          requestId={request.id}
          onClose={() => setOpenModalPrice(false)}
          onSubmit={() => setIsSubmittingPrice(true)}
        />
      )}
    </>
  );
};
