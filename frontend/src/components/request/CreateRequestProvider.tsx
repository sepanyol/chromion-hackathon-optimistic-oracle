import {
  CreateRequestParams,
  generateCreateRequestParams,
  InputCreateRequestParams,
} from "@/hooks/onchain/useCreateRequest";
import { ActionMap, createContext } from "@/utils/context";
import { PropsWithChildren, useContext, useReducer } from "react";

export type CreateRequestType = {
  isModalOpen: boolean;
  isModalLoading: boolean;
  isSubmitting: boolean;
  params: CreateRequestParams | null;
};

const initialState: CreateRequestType = {
  isModalOpen: false,
  isModalLoading: false,
  isSubmitting: false,
  params: null,
};

export enum ActionTypes {
  // modal visibility
  OpenModal = "OPEN_MODAL",
  CloseModal = "CLOSE_MODAL",

  // loader
  EnableLoading = "ENABLE_LOADING",
  DisableLoading = "DISABLE_LOADING",

  EnableSubmitting = "ENABLE_SUBMITTING",
  DisableSubmitting = "DISABLE_SUBMITTING",

  UpdateCreateParams = "UPDATE_CREATE_PARAMS",

  Reset = "RESET",
}

type CreateRequestActionPayloads = {
  [ActionTypes.OpenModal]: undefined;
  [ActionTypes.CloseModal]: undefined;

  [ActionTypes.EnableLoading]: undefined;
  [ActionTypes.DisableLoading]: undefined;

  [ActionTypes.EnableSubmitting]: undefined;
  [ActionTypes.DisableSubmitting]: undefined;

  [ActionTypes.UpdateCreateParams]: InputCreateRequestParams;

  [ActionTypes.Reset]: undefined;
};

export type CreateRequestActions =
  ActionMap<CreateRequestActionPayloads>[keyof ActionMap<CreateRequestActionPayloads>];

const reducer = (
  state: CreateRequestType,
  action: CreateRequestActions
): CreateRequestType => {
  switch (action.type) {
    case ActionTypes.OpenModal:
      return { ...state, isModalOpen: true };
    case ActionTypes.CloseModal:
      return { ...state, isModalOpen: false };

    case ActionTypes.EnableLoading:
      return { ...state, isModalLoading: true };
    case ActionTypes.DisableLoading:
      return { ...state, isModalLoading: false };

    case ActionTypes.EnableSubmitting:
      return { ...state, isSubmitting: true };
    case ActionTypes.DisableSubmitting:
      return { ...state, isSubmitting: false };

    case ActionTypes.UpdateCreateParams:
      return { ...state, params: generateCreateRequestParams(action.payload) };

    case ActionTypes.Reset:
      return { ...initialState };

    default:
      return state;
  }
};

export const CreateRequestContext = createContext<
  CreateRequestType,
  CreateRequestActions
>(initialState);

export const useCreateRequestContext = () => {
  const context = useContext(CreateRequestContext);
  if (context === undefined)
    throw new Error("useCreateRequestContext was used outside of its provider");
  return context;
};

const CreateRequestProvider = function ({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <CreateRequestContext.Provider value={{ state, dispatch }}>
      {children}
    </CreateRequestContext.Provider>
  );
};

export default CreateRequestProvider;
