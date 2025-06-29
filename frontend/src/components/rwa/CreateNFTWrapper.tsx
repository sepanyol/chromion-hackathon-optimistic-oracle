"use client";
import wrapperAbi from "@/abis/wrapper.json";
import { useERC721Approval } from "@/hooks/onchain/useERC721Approval";
import { useEvaluateNFT } from "@/hooks/onchain/useEvaluateNFT";
import { useGetNFTInfos } from "@/hooks/onchain/useGetNFTInfos";
import { useGetNFTOwnerOf } from "@/hooks/onchain/useGetNFTOwnerOf";
import { useMintNFT } from "@/hooks/onchain/useMintNFT";
import { useTokenApproval } from "@/hooks/onchain/useTokenApproval";
import { isSameAddress } from "@/utils/addresses";
import { getNFTWrapperByChainId, getUSDCByChainId } from "@/utils/contracts";
import { isEmpty } from "lodash";
import { Check, Clock } from "lucide-react";
import { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { Abi, Address, isHex, parseEventLogs } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "../Button";
import { Loader } from "../Loader";
import { CreateRequest } from "../request/CreateRequest";
import {
  ActionTypes,
  CreateRequestContext,
} from "../request/CreateRequestProvider";

export const CreateNFTWrapper = () => {
  const { address, chainId } = useAccount();
  const createRequest = useContext(CreateRequestContext);

  const nftInfos = useGetNFTInfos({
    address: createRequest.state.nftParams?.originNFT!,
  });

  const nftOwnerCheck = useGetNFTOwnerOf({
    address: createRequest.state.nftParams?.originNFT!,
    tokenId: createRequest.state.nftParams?.originId
      ? BigInt(createRequest.state.nftParams?.originId!)
      : undefined!,
  });

  // approval for current NFT
  const nftApproval = useERC721Approval({
    address: createRequest.state.nftParams?.originNFT!,
    chainId: chainId!,
    id: createRequest.state.nftParams?.originId
      ? BigInt(createRequest.state.nftParams?.originId!)
      : undefined!,
    spender: getNFTWrapperByChainId(chainId!),
  });

  // approval for current NFT
  const rewardApproval = useTokenApproval({
    address: getUSDCByChainId(chainId!),
    chainId: chainId!,
    spender: getNFTWrapperByChainId(chainId!),
    amount: BigInt(10e6), // TODO maybe read from wrapped nft contract constant or something
  });

  // mint nft
  const mintNFT = useMintNFT({
    enabled:
      !!createRequest.state.nftParams?.originId &&
      !!createRequest.state.nftParams?.originNFT &&
      createRequest.state.isSubmitting,
    originId: Number(createRequest.state.nftParams?.originId),
    originNFT: createRequest.state.nftParams?.originNFT as Address,
  });

  // evaluate nft
  const evaluateNFT = useEvaluateNFT({
    enabled: !!Number(createRequest.state.nftIdForWrapping),
    nftId: Number(createRequest.state.nftIdForWrapping),
    context: createRequest.state.nftParams?.context!,
  });

  const waitForApprovalTX = useWaitForTransactionReceipt({
    chainId,
    hash: createRequest.state.nftApprovalTxHash!,
    query: { enabled: isHex(createRequest.state.nftApprovalTxHash) },
  });

  const waitForRewardApprovalTX = useWaitForTransactionReceipt({
    chainId,
    hash: createRequest.state.nftApprovalRewardTxHash!,
    query: { enabled: isHex(createRequest.state.nftApprovalRewardTxHash) },
  });

  const waitForDepositTX = useWaitForTransactionReceipt({
    chainId,
    hash: createRequest.state.nftDepositTxHash!,
    query: { enabled: isHex(createRequest.state.nftDepositTxHash) },
  });

  const waitForEvaluateTX = useWaitForTransactionReceipt({
    chainId,
    hash: createRequest.state.nftEvaluateTxHash!,
    query: { enabled: isHex(createRequest.state.nftEvaluateTxHash) },
  });

  useEffect(() => {
    createRequest.dispatch({ type: ActionTypes.EnableCreateTokenWrapper });
  }, []);

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

  /// WORKFLOW DEPOSIT
  useEffect(() => {
    if (createRequest.state.isSubmitting) {
      // init approval
      nftApproval.write();
    }
  }, [createRequest.state.isSubmitting]);

  useEffect(() => {
    if (!nftApproval.hash) return;
    // set hash for monitoring recipe
    console.log("Approval NFT Hash", nftApproval.hash);
    createRequest.dispatch({
      type: ActionTypes.SetNftApprovalTxHash,
      payload: { txHash: nftApproval.hash },
    });
  }, [nftApproval.hash]);

  // when approve is finished, start minting
  useEffect(() => {
    if (waitForApprovalTX.isSuccess) {
      createRequest.dispatch({
        type: ActionTypes.UnsetNftApprovalTxHash,
      });
      console.log("Successfully waited for nft approval");
      console.log("Start approval for reward");
      rewardApproval.write();
    }

    if (waitForApprovalTX.error)
      toast.error(`ERROR: ${waitForApprovalTX.error}`);
  }, [
    waitForApprovalTX.data,
    waitForApprovalTX.isSuccess,
    waitForApprovalTX.error,
  ]);

  // when nft approval is done, do reward approval
  useEffect(() => {
    if (!rewardApproval.hash) return;
    // set hash for monitoring recipe
    console.log("Approval Reward Hash", rewardApproval.hash);
    createRequest.dispatch({
      type: ActionTypes.SetNftApprovalRewardTxHash,
      payload: { txHash: rewardApproval.hash },
    });
  }, [rewardApproval.hash]);

  // when reward approval is finished, start minting
  useEffect(() => {
    if (waitForRewardApprovalTX.isSuccess) {
      createRequest.dispatch({
        type: ActionTypes.UnsetNftApprovalRewardTxHash,
      });
      console.log("Successfully waited for reward approval");
      console.log("Start minting");
      mintNFT.write();
    }

    if (waitForRewardApprovalTX.error)
      toast.error(`ERROR: ${waitForRewardApprovalTX.error}`);
  }, [
    waitForRewardApprovalTX.data,
    waitForRewardApprovalTX.isSuccess,
    waitForRewardApprovalTX.error,
  ]);

  console.log("Minting error", mintNFT.simulate.error);

  // start wait for minting hash
  useEffect(() => {
    if (!mintNFT.hash) return;
    // set hash for monitoring recipe
    console.log("Minting Hash", mintNFT.hash);
    createRequest.dispatch({
      type: ActionTypes.SetNftDepositTxHash,
      payload: { txHash: mintNFT.hash },
    });
  }, [mintNFT.hash]);

  // when minting is done, set new nft id
  useEffect(() => {
    if (waitForDepositTX.isSuccess) {
      createRequest.dispatch({
        type: ActionTypes.UnsetNftDepositTxHash,
      });

      console.log("Successfully waited for minting");
      console.log("Check logs for new nft id");

      const logs = parseEventLogs({
        abi: wrapperAbi as Abi,
        logs: waitForDepositTX.data.logs,
      });

      const depositedLog = logs.find((log) => log.eventName == "DepositedNft");

      if (!depositedLog) {
        toast.error(`ERROR: new nft id can't be resolved`);
      } else {
        const { wNft } = depositedLog.args as any;
        console.log("Found and set NFT ID", wNft);
        createRequest.dispatch({
          type: ActionTypes.SetNftIdForWrapping,
          payload: { nftId: Number(wNft) },
        });
      }
    }

    if (waitForDepositTX.error) toast.error(`ERROR: ${waitForDepositTX.error}`);
  }, [
    waitForDepositTX.data,
    waitForDepositTX.isSuccess,
    waitForDepositTX.error,
  ]);

  // when in submitting and nft id is set, start evaluation process
  useEffect(() => {
    if (
      !createRequest.state.isSubmitting ||
      !createRequest.state.nftIdForWrapping ||
      !evaluateNFT.isReady ||
      !evaluateNFT.isEnabled
    )
      return;

    console.log(
      "Form is still submitting and NFT ID is found",
      `${createRequest.state.nftIdForWrapping}`
    );

    evaluateNFT.write();
  }, [
    createRequest.state.isSubmitting,
    createRequest.state.nftIdForWrapping,
    evaluateNFT.isReady,
    evaluateNFT.isEnabled,
  ]);

  // start wait for evaluation
  useEffect(() => {
    if (!evaluateNFT.hash) return;

    console.log("Evaluation Hash", evaluateNFT.hash);

    createRequest.dispatch({
      type: ActionTypes.SetNftEvaluateTxHash,
      payload: { txHash: evaluateNFT.hash },
    });
  }, [evaluateNFT.hash]);

  // when evaluate is done, success
  useEffect(() => {
    if (waitForEvaluateTX.isSuccess) {
      createRequest.dispatch({
        type: ActionTypes.Reset,
      });
      toast.success("Successfully wrapped your NFT and issued a valuation");
    }

    if (waitForEvaluateTX.error)
      toast.error(`ERROR: ${waitForEvaluateTX.error}`);
  }, [waitForEvaluateTX.isSuccess, waitForEvaluateTX.error]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 gap-6">
      <span>
        You've a tokenized asset and don't know what its wort? Check Equolibrium
        Optimistic Oracle
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
      {createRequest.state.isSubmitting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col gap-2 items-center justify-between p-6 border-b border-gray-200">
              <div className="text-xl font-bold">Status</div>
              <div className="flex gap-2 items-center">
                Approve NFT transfer
                {nftApproval.execution.isPending ? (
                  <Loader />
                ) : nftApproval.execution.isSuccess ? (
                  <Check className="text-green-500" />
                ) : (
                  <Clock className="text-orange-500" />
                )}
              </div>
              <div className="flex gap-2 items-center">
                Approve Reward transfer
                {rewardApproval.execution.isPending ? (
                  <Loader />
                ) : rewardApproval.execution.isSuccess ? (
                  <Check className="text-green-500" />
                ) : (
                  <Clock className="text-orange-500" />
                )}
              </div>
              <div className="flex gap-2 items-center">
                Minting & Deposit to Wrapper
                {mintNFT.execution.isPending ? (
                  <Loader />
                ) : mintNFT.execution.isSuccess ? (
                  <Check className="text-green-500" />
                ) : (
                  <Clock className="text-orange-500" />
                )}
              </div>
              <div className="flex gap-2 items-center">
                Create evaluation inquiry
                {evaluateNFT.execution.isPending ? (
                  <Loader />
                ) : evaluateNFT.execution.isSuccess ? (
                  <Check className="text-green-500" />
                ) : (
                  <Clock className="text-orange-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <CreateRequest />
    </div>
  );
};
