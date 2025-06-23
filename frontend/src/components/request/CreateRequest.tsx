import { useCreateRequest } from "@/hooks/onchain/useCreateRequest";
import { ActionTypes, useCreateRequestContext } from "./CreateRequestProvider";
import RequestModal from "./RequestModal";

export const CreateRequest = () => {
  const { state, dispatch } = useCreateRequestContext();

  const createRequest = useCreateRequest({
    params: state.params,
  });

  const handleOnSubmit = () => {
    dispatch({ type: ActionTypes.EnableSubmitting });
    createRequest.initiate();
  };

  console.log("createRequest.allowance.data", createRequest.allowance.data);
  console.log("createRequest.hasAllowance", createRequest.hasAllowance);

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
