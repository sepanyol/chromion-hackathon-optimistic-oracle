import { log } from "matchstick-as";
import {
  DepositedNft as DepositedNftEvent,
  EvaluatioNRequest as EvaluatioNRequestEvent,
  FeedbackSubmitted as FeedbackSubmittedEvent,
  NftBought as NftBoughtEvent,
  NftNowActiveForSale as NftNowActiveForSaleEvent,
  NftNowInactiveForSale as NftNowInactiveForSaleEvent,
  ProposedEvaluationAccepted as ProposedEvaluationAcceptedEvent,
  WithdrawnNft as WithdrawnNftEvent,
  WrappedNft as WrappedNftContract,
} from "../generated/WrappedNft/WrappedNft";
import { WrappedNFT, WrappedNFTValuation } from "../generated/schema";
import { getRequest } from "./helpers";

export function handleDepositedNft(event: DepositedNftEvent): void {
  let entity = new WrappedNFT(
    event.address.concatI32(event.params.wNft.toI32())
  );

  entity.requester = event.params.requester;
  entity.originNFT = event.params.originNFT;
  entity.wNft = event.params.wNft;
  entity.originId = event.params.originId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

// export function handleEvaluatioNRequest(event: EvaluatioNRequestEvent): void {}

// export function handleFeedbackSubmitted(event: FeedbackSubmittedEvent): void {}

// export function handleNftBought(event: NftBoughtEvent): void {}

// export function handleNftNowActiveForSale(
//   event: NftNowActiveForSaleEvent
// ): void {}

// export function handleNftNowInactiveForSale(
//   event: NftNowInactiveForSaleEvent
// ): void {}

export function handleProposedEvaluationAccepted(
  event: ProposedEvaluationAcceptedEvent
): void {
  let nft = WrappedNFT.load(
    event.address.concatI32(event.params.nftid.toI32())
  );

  if (nft == null) {
    log.info("NFT is not existing {}:{}", [
      event.address.toHexString(),
      event.params.nftid.toString(),
    ]);
    return;
  }

  let contract = WrappedNftContract.bind(event.address);
  let request = getRequest(event.params.request);
  let nftValuation = new WrappedNFTValuation(request.id);
  nftValuation.request = request.id;
  nftValuation.nft = nft.id;
  nftValuation.amount = event.params.price;
  nftValuation.asset = contract.usdc();
  nft.currentValuation = nftValuation.id;

  nftValuation.save();
  nft.save();
}

export function handleWithdrawnNft(event: WithdrawnNftEvent): void {}
