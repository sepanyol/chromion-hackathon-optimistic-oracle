import { createMockedFunction, newMockEvent } from "matchstick-as";
import {
  ethereum,
  Address,
  Bytes,
  BigInt,
  crypto,
} from "@graphprotocol/graph-ts";
import {
  AnswerProposed,
  BondRefunded,
  ChallengeSubmitted,
  RequestRegistered,
  RequestResolved,
  ReviewSubmitted,
  RewardDistributed,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
} from "../generated/OracleCoordinator/OracleCoordinator";

export function createAnswerProposedEvent(
  request: Address,
  proposer: Address,
  answer: Bytes
): AnswerProposed {
  let answerProposedEvent = changetype<AnswerProposed>(newMockEvent());

  answerProposedEvent.parameters = new Array();

  answerProposedEvent.parameters.push(
    new ethereum.EventParam("request", ethereum.Value.fromAddress(request))
  );
  answerProposedEvent.parameters.push(
    new ethereum.EventParam("proposer", ethereum.Value.fromAddress(proposer))
  );
  answerProposedEvent.parameters.push(
    new ethereum.EventParam("answer", ethereum.Value.fromBytes(answer))
  );

  return answerProposedEvent;
}

export function createBondRefundedEvent(
  request: Address,
  recipient: Address,
  amount: BigInt
): BondRefunded {
  let bondRefundedEvent = changetype<BondRefunded>(newMockEvent());

  bondRefundedEvent.parameters = new Array();

  bondRefundedEvent.parameters.push(
    new ethereum.EventParam("request", ethereum.Value.fromAddress(request))
  );
  bondRefundedEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  );
  bondRefundedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  );

  return bondRefundedEvent;
}

export function createChallengeSubmittedEvent(
  request: Address,
  challenger: Address,
  answer: Bytes,
  reason: Bytes
): ChallengeSubmitted {
  let challengeSubmittedEvent = changetype<ChallengeSubmitted>(newMockEvent());

  challengeSubmittedEvent.parameters = new Array();

  challengeSubmittedEvent.parameters.push(
    new ethereum.EventParam("request", ethereum.Value.fromAddress(request))
  );
  challengeSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "challenger",
      ethereum.Value.fromAddress(challenger)
    )
  );
  challengeSubmittedEvent.parameters.push(
    new ethereum.EventParam("answer", ethereum.Value.fromBytes(answer))
  );
  challengeSubmittedEvent.parameters.push(
    new ethereum.EventParam("reason", ethereum.Value.fromBytes(reason))
  );

  return challengeSubmittedEvent;
}

export function createRequestRegisteredEvent(
  request: Address,
  requester: Bytes
): RequestRegistered {
  let requestRegisteredEvent = changetype<RequestRegistered>(newMockEvent());

  requestRegisteredEvent.parameters = new Array();

  requestRegisteredEvent.parameters.push(
    new ethereum.EventParam("request", ethereum.Value.fromAddress(request))
  );
  requestRegisteredEvent.parameters.push(
    new ethereum.EventParam("requester", ethereum.Value.fromBytes(requester))
  );

  return requestRegisteredEvent;
}

export function createRequestResolvedEvent(
  request: Address,
  outcome: i32
): RequestResolved {
  let requestResolvedEvent = changetype<RequestResolved>(newMockEvent());

  requestResolvedEvent.parameters = new Array();

  requestResolvedEvent.parameters.push(
    new ethereum.EventParam("request", ethereum.Value.fromAddress(request))
  );
  requestResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "outcome",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(outcome))
    )
  );

  return requestResolvedEvent;
}

export function createReviewSubmittedEvent(
  request: Address,
  reviewer: Address,
  reason: Bytes,
  supportsChallenge: boolean
): ReviewSubmitted {
  let reviewSubmittedEvent = changetype<ReviewSubmitted>(newMockEvent());

  reviewSubmittedEvent.parameters = new Array();

  reviewSubmittedEvent.parameters.push(
    new ethereum.EventParam("request", ethereum.Value.fromAddress(request))
  );
  reviewSubmittedEvent.parameters.push(
    new ethereum.EventParam("reviewer", ethereum.Value.fromAddress(reviewer))
  );
  reviewSubmittedEvent.parameters.push(
    new ethereum.EventParam("reason", ethereum.Value.fromBytes(reason))
  );
  reviewSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "supportsChallenge",
      ethereum.Value.fromBoolean(supportsChallenge)
    )
  );

  return reviewSubmittedEvent;
}

export function createRewardDistributedEvent(
  request: Address,
  recipient: Address,
  amount: BigInt,
  rewardType: BigInt
): RewardDistributed {
  let rewardDistributedEvent = changetype<RewardDistributed>(newMockEvent());

  rewardDistributedEvent.parameters = new Array();

  rewardDistributedEvent.parameters.push(
    new ethereum.EventParam("request", ethereum.Value.fromAddress(request))
  );
  rewardDistributedEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  );
  rewardDistributedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  );
  rewardDistributedEvent.parameters.push(
    new ethereum.EventParam(
      "rewardType",
      ethereum.Value.fromUnsignedBigInt(rewardType)
    )
  );

  return rewardDistributedEvent;
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent());

  roleAdminChangedEvent.parameters = new Array();

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  );
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  );
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  );

  return roleAdminChangedEvent;
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent());

  roleGrantedEvent.parameters = new Array();

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  );
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  );
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  );

  return roleGrantedEvent;
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent());

  roleRevokedEvent.parameters = new Array();

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  );
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  );
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  );

  return roleRevokedEvent;
}

// helpers

export const ORACLE = Address.fromString(
  "0x0000000000000000000000000000000000001111"
);
export const REQUEST_ID = Address.fromString(
  "0x000000000000000000000000000000000000b00b"
);
export const REQUESTER_ID = Bytes.fromHexString(
  "0x0000000000000000000000000000000000000000000000000000000000001337"
);
export const PROPOSER_ID = Address.fromString(
  "0x000000000000000000000000000000000000dead"
);
export const CHALLENGER_ID = Address.fromString(
  "0x000000000000000000000000000000000000d00d"
);
export const REVIEWER_ID = Address.fromString(
  "0x000000000000000000000000000000000000deed"
);
export const PLATFORM = Address.fromString(
  "0x0000000000000000000000000000000000000da0"
);
export const PROPOSER_ANSWER = Bytes.fromUTF8("THIS IS AN ANSWER");

export const outcomeIdFor = crypto.keccak256(
  Bytes.fromUTF8(`${REQUEST_ID.toHex()}-FOR`)
);

export const outcomeIdAgainst = crypto.keccak256(
  Bytes.fromUTF8(`${REQUEST_ID.toHex()}-AGAINST`)
);

export function createOracleMock(
  oracleAddress: Address,
  outcomeFor: boolean,
  outcomeAgainst: boolean
): void {
  // outcome ids
  createMockedFunction(
    oracleAddress,
    "outcomeIdFor",
    "outcomeIdFor(address):(bytes32)"
  )
    .withArgs([ethereum.Value.fromAddress(REQUEST_ID)])
    .returns([ethereum.Value.fromBytes(Bytes.fromByteArray(outcomeIdFor))]);

  createMockedFunction(
    oracleAddress,
    "outcomeIdAgainst",
    "outcomeIdAgainst(address):(bytes32)"
  )
    .withArgs([ethereum.Value.fromAddress(REQUEST_ID)])
    .returns([ethereum.Value.fromBytes(Bytes.fromByteArray(outcomeIdAgainst))]);

  createMockedFunction(
    oracleAddress,
    "proposalChallengeOutcome",
    "proposalChallengeOutcome(bytes32):(bool)"
  )
    .withArgs([
      ethereum.Value.fromFixedBytes(Bytes.fromByteArray(outcomeIdFor)),
    ])
    .returns([ethereum.Value.fromBoolean(outcomeFor)]);

  createMockedFunction(
    oracleAddress,
    "proposalChallengeOutcome",
    "proposalChallengeOutcome(bytes32):(bool)"
  )
    .withArgs([
      ethereum.Value.fromFixedBytes(Bytes.fromByteArray(outcomeIdAgainst)),
    ])
    .returns([ethereum.Value.fromBoolean(outcomeAgainst ? true : false)]);
}
