import {
  CreateNFTRequestParams,
  CreateRequestParams,
  generateCreateRequestParams,
  InputCreateRequestParams,
  InputNFTCreateRequestParams,
} from "@/hooks/onchain/useCreateRequest";
import { ActionMap, createContext } from "@/utils/context";
import { isEmpty } from "lodash";
import { PropsWithChildren, useContext, useReducer } from "react";
import { Address, isAddress } from "viem";

export type CreateRequestType = {
  isModalOpen: boolean;
  isModalLoading: boolean;
  isSubmitting: boolean;
  isSubmitEnabled: boolean;
  isCreateTokenWrapperEnabled: boolean;
  params: CreateRequestParams | null;

  nftParams: CreateNFTRequestParams | null;
  tokenName: string | null;
  tokenSymbol: string | null;
  errorNotOwner: boolean;

  isDepositNftActive: boolean;
  nftApprovalTxHash: Address | null;
  nftApprovalRewardTxHash: Address | null;
  nftDepositTxHash: Address | null;
  nftEvaluateTxHash: Address | null;
  nftIdForWrapping: number | null;
};

const initialState: CreateRequestType = {
  isModalOpen: false,
  isModalLoading: false,
  isSubmitting: false,
  isSubmitEnabled: false,
  isCreateTokenWrapperEnabled: false,
  params: null,

  nftParams: null,
  tokenName: null,
  tokenSymbol: null,
  errorNotOwner: false,
  isDepositNftActive: false,
  nftApprovalTxHash: null,
  nftApprovalRewardTxHash: null,
  nftDepositTxHash: null,
  nftEvaluateTxHash: null,
  nftIdForWrapping: null,
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

  UpdateNFTCreateParams = "UPDATE_NFT_CREATE_PARAMS",

  EnableCreateTokenWrapper = "ENABLE_CREATE_TOKEN_WRAPPER",
  DisableCreateTokenWrapper = "DISABLE_CREATE_TOKEN_WRAPPER",

  UpdateLoadedNFTTokenInfo = "UPDATE_LOADED_NFT_TOKEN_INFO",
  ShowErrorNotOwner = "SHOW_ERROR_NOT_OWNER",
  HideErrorNotOwner = "HIDE_ERROR_NOT_OWNER",

  StartDepositNFT = "START_DEPOSIT_NFT",
  StopDepositNFT = "STOP_DEPOSIT_NFT",
  SetNftApprovalTxHash = "SET_NFT_APPROVAL_TX_HASH",
  UnsetNftApprovalTxHash = "UNSET_NFT_APPROVAL_TX_HASH",
  SetNftApprovalRewardTxHash = "SET_NFT_APPROVAL_REWARD_TX_HASH",
  UnsetNftApprovalRewardTxHash = "UNSET_NFT_APPROVAL_REWARD_TX_HASH",
  SetNftDepositTxHash = "SET_NFT_DEPOSIT_TX_HASH",
  UnsetNftDepositTxHash = "UNSET_NFT_DEPOSIT_TX_HASH",
  SetNftEvaluateTxHash = "SET_NFT_EVALUATE_TX_HASH",
  UnsetNftEvaluateTxHash = "UNSET_NFT_EVALUATE_TX_HASH",
  SetNftIdForWrapping = "SET_NFT_ID_FOR_WRAPPING",
  UnsetNftIdForWrapping = "UNSET_NFT_ID_FOR_WRAPPING",

  Reset = "RESET",
  ResetNFT = "RESET_NFT",
}

type CreateRequestActionPayloads = {
  [ActionTypes.OpenModal]: undefined;
  [ActionTypes.CloseModal]: undefined;

  [ActionTypes.EnableLoading]: undefined;
  [ActionTypes.DisableLoading]: undefined;

  [ActionTypes.EnableSubmitting]: undefined;
  [ActionTypes.DisableSubmitting]: undefined;

  [ActionTypes.UpdateCreateParams]: InputCreateRequestParams;
  [ActionTypes.UpdateNFTCreateParams]: InputNFTCreateRequestParams;

  [ActionTypes.EnableCreateTokenWrapper]: undefined;
  [ActionTypes.DisableCreateTokenWrapper]: undefined;

  [ActionTypes.UpdateLoadedNFTTokenInfo]: {
    name: string | null;
    symbol: string | null;
  };
  [ActionTypes.ShowErrorNotOwner]: undefined;
  [ActionTypes.HideErrorNotOwner]: undefined;
  [ActionTypes.StartDepositNFT]: undefined;
  [ActionTypes.StopDepositNFT]: undefined;
  [ActionTypes.SetNftApprovalTxHash]: {
    txHash: Address;
  };
  [ActionTypes.UnsetNftApprovalTxHash]: undefined;

  [ActionTypes.SetNftDepositTxHash]: {
    txHash: Address;
  };
  [ActionTypes.UnsetNftDepositTxHash]: undefined;

  [ActionTypes.SetNftEvaluateTxHash]: {
    txHash: Address;
  };
  [ActionTypes.UnsetNftEvaluateTxHash]: undefined;

  [ActionTypes.SetNftApprovalRewardTxHash]: {
    txHash: Address;
  };
  [ActionTypes.UnsetNftApprovalRewardTxHash]: undefined;

  [ActionTypes.SetNftIdForWrapping]: {
    nftId: number;
  };
  [ActionTypes.UnsetNftIdForWrapping]: undefined;

  [ActionTypes.Reset]: undefined;
  [ActionTypes.ResetNFT]: undefined;
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

    case ActionTypes.EnableCreateTokenWrapper:
      return { ...state, isCreateTokenWrapperEnabled: true };
    case ActionTypes.DisableCreateTokenWrapper:
      return { ...state, isCreateTokenWrapperEnabled: false };

    case ActionTypes.UpdateCreateParams:
      const params = generateCreateRequestParams(action.payload);
      const isSubmitEnabled =
        !isEmpty(params.question) &&
        !isEmpty(params.context) &&
        [0, 1].includes(params.answerType) &&
        params.rewardAmount > BigInt(0) &&
        params.challengeWindow > 0;

      return { ...state, params, isSubmitEnabled };

    case ActionTypes.UpdateNFTCreateParams: {
      const { context, originId, originNFT } = action.payload;

      return {
        ...state,
        nftParams: { context, originId, originNFT },
        isSubmitEnabled:
          !!context.trim() &&
          originId > BigInt(0) &&
          isAddress(originNFT, { strict: false }),
      };
    }

    case ActionTypes.UpdateLoadedNFTTokenInfo: {
      return {
        ...state,
        tokenName: action.payload.name,
        tokenSymbol: action.payload.symbol,
      };
    }

    case ActionTypes.ShowErrorNotOwner: {
      return {
        ...state,
        errorNotOwner: true,
      };
    }
    case ActionTypes.HideErrorNotOwner: {
      return {
        ...state,
        errorNotOwner: false,
      };
    }

    case ActionTypes.StartDepositNFT: {
      return {
        ...state,
        isDepositNftActive: true,
      };
    }
    case ActionTypes.StopDepositNFT: {
      return {
        ...state,
        isDepositNftActive: false,
      };
    }

    case ActionTypes.SetNftApprovalTxHash: {
      return {
        ...state,
        nftApprovalTxHash: action.payload.txHash,
      };
    }
    case ActionTypes.UnsetNftApprovalTxHash: {
      return {
        ...state,
        nftApprovalTxHash: null,
      };
    }

    case ActionTypes.SetNftApprovalRewardTxHash: {
      return {
        ...state,
        nftApprovalRewardTxHash: action.payload.txHash,
      };
    }
    case ActionTypes.UnsetNftApprovalRewardTxHash: {
      return {
        ...state,
        nftApprovalRewardTxHash: null,
      };
    }

    case ActionTypes.SetNftEvaluateTxHash: {
      return {
        ...state,
        nftEvaluateTxHash: action.payload.txHash,
      };
    }
    case ActionTypes.UnsetNftEvaluateTxHash: {
      return {
        ...state,
        nftEvaluateTxHash: null,
      };
    }

    case ActionTypes.SetNftDepositTxHash: {
      return {
        ...state,
        nftDepositTxHash: action.payload.txHash,
      };
    }
    case ActionTypes.UnsetNftDepositTxHash: {
      return {
        ...state,
        nftDepositTxHash: null,
      };
    }

    case ActionTypes.SetNftIdForWrapping: {
      return {
        ...state,
        nftIdForWrapping: action.payload.nftId,
      };
    }
    case ActionTypes.UnsetNftIdForWrapping: {
      return {
        ...state,
        nftIdForWrapping: null,
      };
    }

    case ActionTypes.Reset:
      return { ...initialState };

    case ActionTypes.ResetNFT:
      return { ...initialState, isCreateTokenWrapperEnabled: true };

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
