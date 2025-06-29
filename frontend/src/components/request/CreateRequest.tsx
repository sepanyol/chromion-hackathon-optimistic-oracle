import { useCreateRequest } from "@/hooks/onchain/useCreateRequest";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { TransactionExecutionError } from "viem";
import { ActionTypes, useCreateRequestContext } from "./CreateRequestProvider";
import NFTRequestModal from "./NFTRequestModal";
import RequestModal from "./RequestModal";

export const CreateRequest = () => {
  const router = useRouter();
  const { state, dispatch } = useCreateRequestContext();

  const createRequest = useCreateRequest({
    params: state.params,
  });

  const handleOnSubmit = () => {
    if (!state.isSubmitEnabled) return;
    dispatch({ type: ActionTypes.EnableSubmitting });
    createRequest.initiate();
  };

  useEffect(() => {
    if (!createRequest.execute.execution.isSuccess) return;
    setTimeout(() => {
      router.refresh();
      dispatch({ type: ActionTypes.Reset });
    }, 6000);
  }, [createRequest.execute.execution.isSuccess]);

  useEffect(() => {
    if (createRequest.approval.execution.error) {
      dispatch({ type: ActionTypes.DisableSubmitting });
      toast.error(
        `Error: ${
          (createRequest.approval.execution.error as TransactionExecutionError)
            .shortMessage
        }`
      );
    }

    if (createRequest.execute.execution.error) {
      dispatch({ type: ActionTypes.DisableSubmitting });
      toast.error(
        `Error: ${
          (createRequest.execute.execution.error as TransactionExecutionError)
            .shortMessage
        }`
      );
    }
  }, [
    createRequest.approval.execution.error,
    createRequest.approval.execution.error,
  ]);

  if (!state.isModalOpen) return <></>;

  return state.isCreateTokenWrapperEnabled ? (
    <NFTRequestModal
      isSubmitting={state.isSubmitting}
      isSubmitDisabled={!state.isSubmitEnabled}
      onUpdate={(data: any) => {
        dispatch({
          type: ActionTypes.UpdateNFTCreateParams,
          payload: {
            context: data.details,
            originId: data.tokenId,
            originNFT: data.tokenAddress,
          },
        });
      }}
      onSubmit={handleOnSubmit}
      onClose={() => {
        dispatch({ type: ActionTypes.ResetNFT });
      }}
    />
  ) : (
    <RequestModal
      isSubmitting={state.isSubmitting}
      isSubmitDisabled={!state.isSubmitEnabled}
      onUpdate={(data: any) => {
        dispatch({
          type: ActionTypes.UpdateCreateParams,
          payload: {
            answerType: data.type == "Bool" ? 0 : 1,
            challengeWindow: Number(data.period),
            context: data.details,
            question: data.description,
            rewardAmount: BigInt(Number(data.reward) * 10 ** 6),
            truthMeaning: data.truthMeaning,
          },
        });
      }}
      onSubmit={handleOnSubmit}
      onClose={() => {
        dispatch({ type: ActionTypes.Reset });
      }}
    />
  );
};
