import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Contract,
  AnswerProposed,
  BondRefunded,
  ChallengeSubmitted,
  RequestRegistered,
  RequestRegistered1,
  RequestResolved,
  ReviewSubmitted,
  RewardDistributed,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked
} from "../generated/Contract/Contract"
import { ExampleEntity } from "../generated/schema"

export function handleAnswerProposed(event: AnswerProposed): void {
  // Entities can be loaded from the store using an ID; this ID
  // needs to be unique across all entities of the same type
  const id = event.transaction.hash.concat(
    Bytes.fromByteArray(Bytes.fromBigInt(event.logIndex))
  )
  let entity = ExampleEntity.load(id)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(id)

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.request = event.params.request
  entity.proposer = event.params.proposer

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.CHALLENGER_BOND(...)
  // - contract.DEFAULT_ADMIN_ROLE(...)
  // - contract.FACTORY_ROLE(...)
  // - contract.FINALIZER_ROLE(...)
  // - contract.PROPOSER_BOND(...)
  // - contract.REVIEWER_BOND(...)
  // - contract.REVIEW_WINDOW(...)
  // - contract.checkUpkeep(...)
  // - contract.getChallenge(...)
  // - contract.getMostRecentPendingFinalization(...)
  // - contract.getProposal(...)
  // - contract.getReviewTally(...)
  // - contract.getReviews(...)
  // - contract.getRoleAdmin(...)
  // - contract.getUserStats(...)
  // - contract.hasRole(...)
  // - contract.isChallenged(...)
  // - contract.isClaimable(...)
  // - contract.platform(...)
  // - contract.reviewerClaimAmount(...)
  // - contract.supportsInterface(...)
  // - contract.usdc(...)
}

export function handleBondRefunded(event: BondRefunded): void {}

export function handleChallengeSubmitted(event: ChallengeSubmitted): void {}

export function handleRequestRegistered(event: RequestRegistered): void {}

export function handleRequestRegistered1(event: RequestRegistered1): void {}

export function handleRequestResolved(event: RequestResolved): void {}

export function handleReviewSubmitted(event: ReviewSubmitted): void {}

export function handleRewardDistributed(event: RewardDistributed): void {}

export function handleRoleAdminChanged(event: RoleAdminChanged): void {}

export function handleRoleGranted(event: RoleGranted): void {}

export function handleRoleRevoked(event: RoleRevoked): void {}
