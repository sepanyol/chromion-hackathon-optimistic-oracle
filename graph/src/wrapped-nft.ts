import {
  DepositedNft as DepositedNftEvent,
  EvaluatioNRequest as EvaluatioNRequestEvent,
  FeedbackSubmitted as FeedbackSubmittedEvent,
  NftBought as NftBoughtEvent,
  NftNowActiveForSale as NftNowActiveForSaleEvent,
  NftNowInactiveForSale as NftNowInactiveForSaleEvent,
  ProposedEvaluationAccepted as ProposedEvaluationAcceptedEvent,
  WithdrawnNft as WithdrawnNftEvent,
} from "../generated/WrappedNft/WrappedNft";
import { WrappedNFT } from "../generated/schema";

export function handleDepositedNft(event: DepositedNftEvent): void {
  let entity = new WrappedNFT(
    event.params.originNFT.concatI32(event.params.originId.toI32())
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

export function handleEvaluatioNRequest(event: EvaluatioNRequestEvent): void {}

export function handleFeedbackSubmitted(event: FeedbackSubmittedEvent): void {}

export function handleNftBought(event: NftBoughtEvent): void {}

export function handleNftNowActiveForSale(
  event: NftNowActiveForSaleEvent
): void {}

export function handleNftNowInactiveForSale(
  event: NftNowInactiveForSaleEvent
): void {}

export function handleProposedEvaluationAccepted(
  event: ProposedEvaluationAcceptedEvent
): void {}

export function handleWithdrawnNft(event: WithdrawnNftEvent): void {}
