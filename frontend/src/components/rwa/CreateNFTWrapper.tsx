"use client";
import wrapperAbi from "@/abis/wrapper.json";
import { useGetNFTInfos } from "@/hooks/onchain/useGetNFTInfos";
import { useGetNFTOwnerOf } from "@/hooks/onchain/useGetNFTOwnerOf";
import { isSameAddress } from "@/utils/addresses";
import { getNFTWrapperByChainId, getUSDCByChainId } from "@/utils/contracts";
import {
  useEvmClients,
  useEvmTransactionFlow,
} from "@s3panyol/use-evm-transaction-flow";
import { isEmpty } from "lodash";
import { Check, Clock } from "lucide-react";
import { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { Abi, Address, parseEventLogs } from "viem";
import { Button } from "../Button";
import { Loader } from "../Loader";
import { CreateRequest } from "../request/CreateRequest";
import {
  ActionTypes,
  CreateRequestContext,
} from "../request/CreateRequestProvider";

export const CreateNFTWrapper = () => {
  const createRequest = useContext(CreateRequestContext);

  const { account: address, walletClient, publicClient } = useEvmClients();

  const nftInfos = useGetNFTInfos({
    address: createRequest.state.nftParams?.originNFT!,
  });

  const nftOwnerCheck = useGetNFTOwnerOf({
    address: createRequest.state.nftParams?.originNFT!,
    tokenId: createRequest.state.nftParams?.originId
      ? BigInt(createRequest.state.nftParams?.originId!)
      : undefined!,
  });

  // NFT Wrapping
  const originNftAddress = createRequest.state.nftParams?.originNFT as Address;
  const originNftId = BigInt(createRequest.state.nftParams?.originId || 0);
  const wrapperAddress = getNFTWrapperByChainId(walletClient?.chain.id!);
  const rewardAddress = getUSDCByChainId(walletClient?.chain.id!);

  const nftWrap = useEvmTransactionFlow({
    tokenType: "ERC721",
    tokenAddress: originNftAddress,
    tokenId: originNftId,
    amount: BigInt(1),
    spender: wrapperAddress,
    abi: wrapperAbi as Abi,
    functionName: "deposit",
    // requireExplicitApproval: true, // TODO when it works, enable it
    args: [originNftId, originNftAddress],
    contractAddress: wrapperAddress,
  });

  // NFT Valuation
  const nftValuation = useEvmTransactionFlow({
    tokenType: "ERC20",
    tokenAddress: rewardAddress,
    amount: BigInt(10e6),
    spender: wrapperAddress,
    abi: wrapperAbi as Abi,
    functionName: "evaluate",
    // requireExplicitApproval: true,
    args: [
      Number(createRequest.state.nftIdForWrapping),
      createRequest.state.nftParams?.context!,
    ],
    contractAddress: wrapperAddress,
  });

  // init, set proper create form state
  useEffect(() => {
    createRequest.dispatch({ type: ActionTypes.EnableCreateTokenWrapper });
  }, []);

  // form info, when token info was loaded properly
  useEffect(() => {
    if (!nftInfos.data) return;

    createRequest.dispatch({
      type: ActionTypes.UpdateLoadedNFTTokenInfo,
      payload: {
        name: nftInfos.data.name as any,
        symbol: nftInfos.data.symbol as any,
      },
    });
  }, [nftInfos.data]);

  // error handling of invalid input of token information by "owner"
  useEffect(() => {
    if (isEmpty(createRequest.state.nftParams?.originId)) {
      createRequest.dispatch({
        type: ActionTypes.HideErrorNotOwner,
      });
      return;
    } else {
      if (nftOwnerCheck.error) {
        createRequest.dispatch({
          type: ActionTypes.ShowErrorNotOwner,
        });
      } else if (
        nftOwnerCheck.data &&
        isSameAddress(nftOwnerCheck.data as string, address)
      ) {
        createRequest.dispatch({
          type: ActionTypes.HideErrorNotOwner,
        });
      } else {
        createRequest.dispatch({
          type: ActionTypes.ShowErrorNotOwner,
        });
      }
    }
  }, [
    address,
    nftOwnerCheck.data,
    nftOwnerCheck.error,
    createRequest.state.nftParams?.originId,
  ]);

  // Start flow
  // 1. NFT Wrapping
  useEffect(() => {
    if (
      createRequest.state.isSubmitting &&
      createRequest.state.isCreateTokenWrapperEnabled
    )
      nftWrap.run();
  }, [
    createRequest.state.isSubmitting,
    createRequest.state.isCreateTokenWrapperEnabled,
  ]);

  // 2. NFT Valuation
  useEffect(() => {
    // started from process
    if (
      nftWrap.isSuccess &&
      nftValuation.isReady &&
      createRequest.state.nftIdForWrapping
    )
      nftValuation.run();
  }, [
    nftWrap.isSuccess,
    nftValuation.isReady,
    createRequest.state.nftIdForWrapping,
  ]);

  // error handling
  useEffect(() => {
    if (nftWrap.error) {
      toast.error(`ERROR: ${nftWrap.error}`, { toastId: "wrapError" });
    } else if (nftValuation.error) {
      toast.error(`ERROR: ${nftValuation.error}`, { toastId: "valuateError" });
    }
  }, [nftWrap.error, nftValuation.error]);

  // when minting is done, set new nft id
  useEffect(() => {
    if (nftWrap.isSuccess && nftWrap.executeHash && publicClient) {
      publicClient
        .getTransactionReceipt({ hash: nftWrap.executeHash })
        .then((receipt) => {
          const depositedLog = parseEventLogs({
            abi: wrapperAbi as Abi,
            logs: receipt.logs,
          }).find((log) => log.eventName == "DepositedNft");
          if (!depositedLog) {
            toast.error(`ERROR: new nft id can't be resolved`, {
              toastId: "failResolve",
            });
          } else {
            createRequest.dispatch({
              type: ActionTypes.SetNftIdForWrapping,
              payload: { nftId: Number((depositedLog.args as any).wNft) },
            });
          }
        });
    }
  }, [nftWrap.isSuccess, nftWrap.executeHash, publicClient]);

  // when evaluate is done, success
  useEffect(() => {
    if (nftWrap.isSuccess && nftValuation.isSuccess) {
      createRequest.dispatch({
        type: ActionTypes.Reset,
      });
      toast.success("Successfully wrapped your NFT and issued a valuation");
    } else if (!nftWrap.isSuccess && nftValuation.isSuccess) {
      createRequest.dispatch({
        type: ActionTypes.Reset,
      });
      toast.success("Successfully issued a valuation");
    }
  }, [nftWrap.isSuccess, nftValuation.isSuccess]);

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-4 lg:gap-0 lg:flex-row items-center justify-between">
            <span>
              You've a tokenized asset and don't know what its wort? Check
              Equolibrium Optimistic Oracle
            </span>
            <div>
              <Button
                onClick={() => {
                  createRequest.dispatch({ type: ActionTypes.OpenModal });
                }}
              >
                What's my RWA worth?
              </Button>
            </div>
          </div>
        </div>
      </div>
      {createRequest.state.isSubmitting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col gap-2 items-center justify-between p-6 border-b border-gray-200">
              <div className="text-xl font-bold">Status</div>
              <div className="flex gap-2 items-center">
                Approve NFT transfer
                {nftWrap.isSuccess ||
                nftWrap.isExecuting ||
                nftWrap.isWaitingForExecutionTxConfirmation ? (
                  <Check className="text-green-500" />
                ) : nftWrap.isError ? (
                  <Clock className="text-orange-500" />
                ) : (
                  <Loader />
                )}
              </div>
              <div className="flex gap-2 items-center">
                Minting & Deposit to Wrapper
                {nftWrap.isSuccess ? (
                  <Check className="text-green-500" />
                ) : nftWrap.isError ? (
                  <Clock className="text-orange-500" />
                ) : (
                  <Loader />
                )}
              </div>
              <div className="flex gap-2 items-center">
                Approve Reward transfer
                {nftValuation.isSuccess ||
                nftValuation.isExecuting ||
                nftValuation.isWaitingForExecutionTxConfirmation ? (
                  <Check className="text-green-500" />
                ) : nftValuation.isError ? (
                  <Clock className="text-orange-500" />
                ) : (
                  <Loader />
                )}
              </div>
              <div className="flex gap-2 items-center">
                Create evaluation inquiry
                {nftValuation.isSuccess ? (
                  <Check className="text-green-500" />
                ) : nftValuation.isError ? (
                  <Clock className="text-orange-500" />
                ) : (
                  <Loader />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <CreateRequest />
    </>
  );
};
