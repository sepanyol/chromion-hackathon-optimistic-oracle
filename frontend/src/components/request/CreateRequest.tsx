import { useCreateRequest } from "@/hooks/onchain/useCreateRequest";
import { ActionTypes, useCreateRequestContext } from "./CreateRequestProvider";
import RequestModal from "./RequestModal";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const CreateRequest = () => {
  const router = useRouter();
  const { state, dispatch } = useCreateRequestContext();

  const createRequest = useCreateRequest({
    params: state.params,
  });

  const handleOnSubmit = () => {
    dispatch({ type: ActionTypes.EnableSubmitting });
    createRequest.initiate();
  };

  useEffect(() => {
    if (!router || !dispatch) return;

    if (createRequest.execute.execution.isSuccess)
      dispatch({ type: ActionTypes.Reset });

    router.refresh();
  }, [router, dispatch, createRequest.execute.execution.isSuccess]);

  if (!state.isModalOpen) return <></>;

  return (
    <RequestModal
      isSubmitting={state.isSubmitting}
      isSubmitDisabled={!createRequest.execute.isReady}
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
        dispatch({ type: ActionTypes.CloseModal });
        dispatch({ type: ActionTypes.Reset });
      }}
    />
  );
};
