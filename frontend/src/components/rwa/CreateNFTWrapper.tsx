"use client";
import { useGetNFTInfos } from "@/hooks/onchain/useGetNFTInfos";
import { useGetNFTOwnerOf } from "@/hooks/onchain/useGetNFTOwnerOf";
import { isSameAddress } from "@/utils/addresses";
import { isEmpty } from "lodash";
import { useContext, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "../Button";
import { CreateRequest } from "../request/CreateRequest";
import {
  ActionTypes,
  CreateRequestContext,
} from "../request/CreateRequestProvider";

export const CreateNFTWrapper = () => {
  const { address } = useAccount();
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
      <CreateRequest />
    </div>
  );
};
