import { useCreateRequest } from "@/hooks/onchain/useCreateRequest";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { parseUnits } from "viem";
import { useOracleContext } from "../OracleProvider";
import { ActionTypes, useCreateRequestContext } from "./CreateRequestProvider";
import RequestModal from "./RequestModal";

export const CreateRequest = () => {
  const router = useRouter();
  const { state, dispatch } = useCreateRequestContext();
  const { assetDecimals, isOracleLoaded } = useOracleContext();

  const createRequest = useCreateRequest({
    params: state.params,
  });

  const handleOnSubmit = () => {
    if (!state.isSubmitEnabled) return;
    dispatch({ type: ActionTypes.EnableSubmitting });
    createRequest.run();
  };

  useEffect(() => {
    if (!createRequest.isSuccess) return;

    toast.success(`Successfully create your request`, { delay: 6000 });
    setTimeout(() => {
      router.refresh();
      dispatch({ type: ActionTypes.Reset });
    }, 6000);
  }, [createRequest.isSuccess]);

  useEffect(() => {
    if (!createRequest.isError && !createRequest.error) return;
    dispatch({ type: ActionTypes.DisableSubmitting });
    toast.error(`Error: ${createRequest.error}`);
  }, [createRequest.error, createRequest.isError]);

  if (!state.isModalOpen) return <></>;

  return (
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
            rewardAmount: parseUnits(data.reward || "0", assetDecimals!),
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
