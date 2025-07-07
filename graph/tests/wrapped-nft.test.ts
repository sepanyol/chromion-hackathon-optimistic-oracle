import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  afterAll,
  beforeAll,
  clearStore,
  describe,
  test,
  assert,
  beforeEach,
  newMockCall,
  createMockedFunction,
} from "matchstick-as/assembly/index";
import {
  createApprovalEvent,
  createDepositedNftEvent,
  createProposedEvaluationAcceptedEvent,
} from "./wrapped-nft-utils";
import {
  handleDepositedNft,
  handleProposedEvaluationAccepted,
} from "../src/wrapped-nft";
import { DepositedNft, WrappedNft } from "../generated/WrappedNft/WrappedNft";
import { Request, WrappedNFT, WrappedNFTValuation } from "../generated/schema";
import { getRequest } from "../src/helpers";
import { log } from "@graphprotocol/graph-ts";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

class TestHelper {
  eventInitiator: Address = Address.fromString(
    "0x000000000000000000000000000000000000d00d"
  );
  usdc: Address = Address.fromString(
    "0x0000000000000000000000000000000000001337"
  );
  requestAddress: Address = Address.fromString(
    "0x0000000000000000000000000000000000000001"
  );
  requesterAddress: Address = Address.fromString(
    "0x0000000000000000000000000000000000000002"
  );
  originNFTAddress: Address = Address.fromString(
    "0x0000000000000000000000000000000000000003"
  );
  nftOwner: Address = Address.fromString(
    "0x0000000000000000000000000000000000000004"
  );
  wrappedNftId: BigInt = BigInt.fromI32(10);
  originNFTId: BigInt = BigInt.fromI32(20);
}

describe("Describe entity assertions", () => {
  beforeAll(() => {});

  afterAll(() => {
    clearStore();
  });

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("handleDepositedNft should register a deposited NFT", () => {
    let helper = new TestHelper();
    const event = createDepositedNftEvent(
      helper.requesterAddress,
      helper.originNFTAddress,
      helper.wrappedNftId,
      helper.originNFTId
    );

    event.address = helper.eventInitiator;

    let id = event.address.concatI32(10 as i32).toHexString();

    assert.notInStore("WrappedNFT", id, "Should not be in store");
    handleDepositedNft(event);

    let nft = WrappedNFT.load(event.address.concatI32(10 as i32));
    if (!nft) return;

    assert.equals(
      ethereum.Value.fromBytes(nft.id),
      ethereum.Value.fromBytes(event.address.concatI32(10 as i32))
    );
    assert.equals(
      ethereum.Value.fromBytes(nft.requester),
      ethereum.Value.fromBytes(event.params.requester)
    );
    assert.equals(
      ethereum.Value.fromBytes(nft.originNFT),
      ethereum.Value.fromBytes(event.params.originNFT)
    );
    assert.equals(
      ethereum.Value.fromUnsignedBigInt(nft.wNft),
      ethereum.Value.fromUnsignedBigInt(event.params.wNft)
    );
    assert.equals(
      ethereum.Value.fromUnsignedBigInt(nft.originId),
      ethereum.Value.fromUnsignedBigInt(event.params.originId)
    );
    assert.equals(
      ethereum.Value.fromUnsignedBigInt(nft.blockNumber),
      ethereum.Value.fromUnsignedBigInt(event.block.number)
    );
    assert.equals(
      ethereum.Value.fromUnsignedBigInt(nft.blockTimestamp),
      ethereum.Value.fromUnsignedBigInt(event.block.timestamp)
    );
    assert.equals(
      ethereum.Value.fromBytes(nft.transactionHash),
      ethereum.Value.fromBytes(event.transaction.hash)
    );
  });

  describe("Valuations", () => {
    beforeEach(() => {
      let helper = new TestHelper();

      let event = createDepositedNftEvent(
        helper.requesterAddress,
        helper.originNFTAddress,
        helper.wrappedNftId,
        helper.originNFTId
      );

      event.address = helper.eventInitiator;

      handleDepositedNft(event);
    });

    test("Accept valuation", () => {
      let helper = new TestHelper();

      let event = createProposedEvaluationAcceptedEvent(
        helper.requestAddress,
        helper.wrappedNftId,
        helper.nftOwner,
        BigInt.fromString("1337000000")
      );

      event.address = helper.eventInitiator;

      createMockedFunction(event.address, "usdc", "usdc():(address)").returns([
        ethereum.Value.fromAddress(helper.usdc),
      ]);

      // hydrate state
      let requestEntity = getRequest(helper.requestAddress);
      requestEntity.requester = helper.requesterAddress;
      requestEntity.originAddress = Bytes.empty();
      requestEntity.originChainId = Bytes.empty();
      requestEntity.answerType = 0;
      requestEntity.challengeWindow = BigInt.zero();
      requestEntity.rewardAmount = BigInt.zero();
      requestEntity.question = "";
      requestEntity.context = "";
      requestEntity.truthMeaning = "";
      requestEntity.isCrossChain = false;
      requestEntity.createdAt = BigInt.zero();
      requestEntity.status = 0;
      requestEntity.save();

      handleProposedEvaluationAccepted(event);

      let id = requestEntity.id.toHexString();
      let ename = "WrappedNFTValuation";
      assert.fieldEquals(ename, id, "id", id);
      assert.fieldEquals(ename, id, "request", id);
      assert.fieldEquals(ename, id, "amount", "1337000000");
      assert.fieldEquals(ename, id, "asset", helper.usdc.toHexString());

      assert.fieldEquals(
        "WrappedNFT",
        helper.eventInitiator
          .concatI32(helper.wrappedNftId.toI32())
          .toHexString(),
        "currentValuation",
        id
      );

      // test valudations
      let nft = WrappedNFT.load(
        helper.eventInitiator.concatI32(helper.wrappedNftId.toI32())
      );
      assert.assertNotNull(nft, "NFT does not exist [1]");
      if (nft) {
        assert.assertTrue(
          nft.valuations.load().length == 1,
          "nft should have one entry in valuations"
        );
      } else assert.assertTrue(false, "NFT does not exist [2]");
    });
  });
});
