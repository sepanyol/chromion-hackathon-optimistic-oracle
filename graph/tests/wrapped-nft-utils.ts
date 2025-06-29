import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
  Approval,
  ApprovalForAll,
  DepositedNft,
  EvaluatioNRequest,
  FeedbackSubmitted,
  Initialized,
  NftBought,
  NftNowActiveForSale,
  NftNowInactiveForSale,
  OwnershipTransferred,
  ProposedEvaluationAccepted,
  Transfer,
  Upgraded,
  WithdrawnNft,
} from "../generated/WrappedNft/WrappedNft";

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent());

  approvalEvent.parameters = new Array();

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  );
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  );
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );

  return approvalEvent;
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent());

  approvalForAllEvent.parameters = new Array();

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  );
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  );
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  );

  return approvalForAllEvent;
}

export function createDepositedNftEvent(
  requester: Address,
  originNFT: Address,
  wNft: BigInt,
  originId: BigInt
): DepositedNft {
  let depositedNftEvent = changetype<DepositedNft>(newMockEvent());

  depositedNftEvent.parameters = new Array();

  depositedNftEvent.parameters.push(
    new ethereum.EventParam("requester", ethereum.Value.fromAddress(requester))
  );
  depositedNftEvent.parameters.push(
    new ethereum.EventParam("originNFT", ethereum.Value.fromAddress(originNFT))
  );
  depositedNftEvent.parameters.push(
    new ethereum.EventParam("wNft", ethereum.Value.fromUnsignedBigInt(wNft))
  );
  depositedNftEvent.parameters.push(
    new ethereum.EventParam(
      "originId",
      ethereum.Value.fromUnsignedBigInt(originId)
    )
  );

  return depositedNftEvent;
}

export function createEvaluatioNRequestEvent(
  requestAddress: Address,
  _context: string,
  _wNftId: BigInt
): EvaluatioNRequest {
  let evaluatioNRequestEvent = changetype<EvaluatioNRequest>(newMockEvent());

  evaluatioNRequestEvent.parameters = new Array();

  evaluatioNRequestEvent.parameters.push(
    new ethereum.EventParam(
      "requestAddress",
      ethereum.Value.fromAddress(requestAddress)
    )
  );
  evaluatioNRequestEvent.parameters.push(
    new ethereum.EventParam("_context", ethereum.Value.fromString(_context))
  );
  evaluatioNRequestEvent.parameters.push(
    new ethereum.EventParam(
      "_wNftId",
      ethereum.Value.fromUnsignedBigInt(_wNftId)
    )
  );

  return evaluatioNRequestEvent;
}

export function createFeedbackSubmittedEvent(
  requester: Address,
  message: string,
  accepted: boolean
): FeedbackSubmitted {
  let feedbackSubmittedEvent = changetype<FeedbackSubmitted>(newMockEvent());

  feedbackSubmittedEvent.parameters = new Array();

  feedbackSubmittedEvent.parameters.push(
    new ethereum.EventParam("requester", ethereum.Value.fromAddress(requester))
  );
  feedbackSubmittedEvent.parameters.push(
    new ethereum.EventParam("message", ethereum.Value.fromString(message))
  );
  feedbackSubmittedEvent.parameters.push(
    new ethereum.EventParam("accepted", ethereum.Value.fromBoolean(accepted))
  );

  return feedbackSubmittedEvent;
}

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent());

  initializedEvent.parameters = new Array();

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  );

  return initializedEvent;
}

export function createNftBoughtEvent(
  buyer: Address,
  wrappedNftId: BigInt,
  nftId: BigInt,
  price: BigInt
): NftBought {
  let nftBoughtEvent = changetype<NftBought>(newMockEvent());

  nftBoughtEvent.parameters = new Array();

  nftBoughtEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  );
  nftBoughtEvent.parameters.push(
    new ethereum.EventParam(
      "wrappedNftId",
      ethereum.Value.fromUnsignedBigInt(wrappedNftId)
    )
  );
  nftBoughtEvent.parameters.push(
    new ethereum.EventParam("nftId", ethereum.Value.fromUnsignedBigInt(nftId))
  );
  nftBoughtEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  );

  return nftBoughtEvent;
}

export function createNftNowActiveForSaleEvent(
  wrappedNftId: BigInt
): NftNowActiveForSale {
  let nftNowActiveForSaleEvent =
    changetype<NftNowActiveForSale>(newMockEvent());

  nftNowActiveForSaleEvent.parameters = new Array();

  nftNowActiveForSaleEvent.parameters.push(
    new ethereum.EventParam(
      "wrappedNftId",
      ethereum.Value.fromUnsignedBigInt(wrappedNftId)
    )
  );

  return nftNowActiveForSaleEvent;
}

export function createNftNowInactiveForSaleEvent(
  wrappedNftId: BigInt
): NftNowInactiveForSale {
  let nftNowInactiveForSaleEvent =
    changetype<NftNowInactiveForSale>(newMockEvent());

  nftNowInactiveForSaleEvent.parameters = new Array();

  nftNowInactiveForSaleEvent.parameters.push(
    new ethereum.EventParam(
      "wrappedNftId",
      ethereum.Value.fromUnsignedBigInt(wrappedNftId)
    )
  );

  return nftNowInactiveForSaleEvent;
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent());

  ownershipTransferredEvent.parameters = new Array();

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  );
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  );

  return ownershipTransferredEvent;
}

export function createProposedEvaluationAcceptedEvent(
  request: Address,
  nftid: BigInt,
  caller: Address,
  price: BigInt
): ProposedEvaluationAccepted {
  let proposedEvaluationAcceptedEvent =
    changetype<ProposedEvaluationAccepted>(newMockEvent());

  proposedEvaluationAcceptedEvent.parameters = new Array();

  proposedEvaluationAcceptedEvent.parameters.push(
    new ethereum.EventParam("request", ethereum.Value.fromAddress(request))
  );
  proposedEvaluationAcceptedEvent.parameters.push(
    new ethereum.EventParam("nftid", ethereum.Value.fromUnsignedBigInt(nftid))
  );
  proposedEvaluationAcceptedEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(caller))
  );
  proposedEvaluationAcceptedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  );

  return proposedEvaluationAcceptedEvent;
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent());

  transferEvent.parameters = new Array();

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  );
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );

  return transferEvent;
}

export function createUpgradedEvent(implementation: Address): Upgraded {
  let upgradedEvent = changetype<Upgraded>(newMockEvent());

  upgradedEvent.parameters = new Array();

  upgradedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  );

  return upgradedEvent;
}

export function createWithdrawnNftEvent(
  requester: Address,
  originNFT: Address,
  wNft: BigInt,
  originId: BigInt
): WithdrawnNft {
  let withdrawnNftEvent = changetype<WithdrawnNft>(newMockEvent());

  withdrawnNftEvent.parameters = new Array();

  withdrawnNftEvent.parameters.push(
    new ethereum.EventParam("requester", ethereum.Value.fromAddress(requester))
  );
  withdrawnNftEvent.parameters.push(
    new ethereum.EventParam("originNFT", ethereum.Value.fromAddress(originNFT))
  );
  withdrawnNftEvent.parameters.push(
    new ethereum.EventParam("wNft", ethereum.Value.fromUnsignedBigInt(wNft))
  );
  withdrawnNftEvent.parameters.push(
    new ethereum.EventParam(
      "originId",
      ethereum.Value.fromUnsignedBigInt(originId)
    )
  );

  return withdrawnNftEvent;
}
