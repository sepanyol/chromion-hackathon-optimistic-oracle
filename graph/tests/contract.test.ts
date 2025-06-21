import { BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  afterEach,
  assert,
  beforeAll,
  beforeEach,
  clearStore,
  createMockedFunction,
  describe,
  test,
} from "matchstick-as/assembly/index";

import {
  divBigIntAndCreateTwoDigitDecimal,
  handleAnswerProposed,
  handleChallengeSubmitted,
  handleRequestRegistered,
  handleRequestResolved,
  handleReviewSubmitted,
  handleRewardDistributed,
} from "../src/oracle-coordinator";
import {
  CHALLENGER_ID,
  createAnswerProposedEvent,
  createChallengeSubmittedEvent,
  createOracleMock,
  createRequestRegisteredEvent,
  createRequestResolvedEvent,
  createReviewSubmittedEvent,
  createRewardDistributedEvent,
  PLATFORM,
  PROPOSER_ANSWER,
  PROPOSER_ID,
  REQUEST_ID,
  REQUESTER_ID,
  REVIEWER_ID,
} from "./contract-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    createMockedFunction(
      REQUEST_ID,
      "originAddress",
      "originAddress():(bytes)"
    ).returns([ethereum.Value.fromBytes(Bytes.empty())]);
    createMockedFunction(
      REQUEST_ID,
      "originChainId",
      "originChainId():(bytes)"
    ).returns([ethereum.Value.fromBytes(Bytes.empty())]);
    createMockedFunction(
      REQUEST_ID,
      "answerType",
      "answerType():(uint8)"
    ).returns([ethereum.Value.fromUnsignedBigInt(BigInt.zero())]);
    createMockedFunction(
      REQUEST_ID,
      "challengeWindow",
      "challengeWindow():(uint40)"
    ).returns([ethereum.Value.fromI32(86400)]);
    createMockedFunction(
      REQUEST_ID,
      "rewardAmount",
      "rewardAmount():(uint96)"
    ).returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("10000000000")),
    ]);
    createMockedFunction(REQUEST_ID, "question", "question():(string)").returns(
      [ethereum.Value.fromString("test question")]
    );
    createMockedFunction(REQUEST_ID, "context", "context():(string)").returns([
      ethereum.Value.fromString("test context"),
    ]);
    createMockedFunction(
      REQUEST_ID,
      "truthMeaning",
      "truthMeaning():(string)"
    ).returns([ethereum.Value.fromString("test truthMeaning")]);
    createMockedFunction(
      REQUEST_ID,
      "isOracleChain",
      "isOracleChain():(bool)"
    ).returns([ethereum.Value.fromBoolean(false)]);
    createMockedFunction(
      REQUEST_ID,
      "createdAt",
      "createdAt():(uint40)"
    ).returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI64(2000000000))]);
    createMockedFunction(REQUEST_ID, "status", "status():(uint8)").returns([
      ethereum.Value.fromI32(1),
    ]);
  });

  beforeEach(() => {
    // request contracts ids
    createMockedFunction(REQUEST_ID, "status", "status():(uint8)").returns([
      ethereum.Value.fromI32(4),
    ]);

    createMockedFunction(REQUEST_ID, "answer", "answer():(bytes)").returns([
      ethereum.Value.fromBytes(Bytes.fromUTF8("ANSWER")),
    ]);
  });

  afterEach(() => {
    clearStore();
  });

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("divBigIntAndCreateTwoDigitDecimal", () => {
    {
      const a = BigInt.fromI32(12345 as i32);
      const b = BigInt.fromI32(54321 as i32);
      const result = divBigIntAndCreateTwoDigitDecimal(a, b);
      assert.assertTrue(result.equals(BigDecimal.fromString("22.72")));
    }

    {
      const a = BigInt.fromI32(0 as i32);
      const b = BigInt.fromI32(1 as i32);
      const result = divBigIntAndCreateTwoDigitDecimal(a, b);
      assert.assertTrue(result.equals(BigDecimal.fromString("0")));
    }
  });

  test("handleRewardDistributed for unchallenged proposer", () => {
    const registerEvent = createRequestRegisteredEvent(
      REQUEST_ID,
      REQUESTER_ID
    );

    createOracleMock(registerEvent.address, false, false);

    handleRequestRegistered(registerEvent);

    handleAnswerProposed(
      createAnswerProposedEvent(REQUEST_ID, PROPOSER_ID, PROPOSER_ANSWER)
    );

    handleRequestResolved(createRequestResolvedEvent(REQUEST_ID, 4));
  });

  test("handleRewardDistributed for challenged proposer on draw (0:0 or 10:10)", () => {
    const registerEvent = createRequestRegisteredEvent(
      REQUEST_ID,
      REQUESTER_ID
    );

    createOracleMock(registerEvent.address, false, false);

    handleRequestRegistered(registerEvent);

    handleAnswerProposed(
      createAnswerProposedEvent(REQUEST_ID, PROPOSER_ID, PROPOSER_ANSWER)
    );

    handleChallengeSubmitted(
      createChallengeSubmittedEvent(
        REQUEST_ID,
        CHALLENGER_ID,
        Bytes.fromUTF8("MY ANSWER"),
        Bytes.fromUTF8("")
      )
    );

    handleRequestResolved(createRequestResolvedEvent(REQUEST_ID, 4));
  });

  test("handleRewardDistributed for challenger when won on challenge", () => {
    const registerEvent = createRequestRegisteredEvent(
      REQUEST_ID,
      REQUESTER_ID
    );

    createOracleMock(registerEvent.address, false, false);

    handleRequestRegistered(registerEvent);

    handleAnswerProposed(
      createAnswerProposedEvent(REQUEST_ID, PROPOSER_ID, PROPOSER_ANSWER)
    );

    handleChallengeSubmitted(
      createChallengeSubmittedEvent(
        REQUEST_ID,
        CHALLENGER_ID,
        Bytes.fromUTF8("MY ANSWER"),
        Bytes.fromUTF8("")
      )
    );

    handleReviewSubmitted(
      createReviewSubmittedEvent(
        REQUEST_ID,
        REVIEWER_ID,
        Bytes.fromUTF8("REVIEW"),
        true
      )
    );

    handleRequestResolved(createRequestResolvedEvent(REQUEST_ID, 4));
  });

  test("handleRewardDistributed for proposer when won on challenge", () => {
    const registerEvent = createRequestRegisteredEvent(
      REQUEST_ID,
      REQUESTER_ID
    );

    createOracleMock(registerEvent.address, false, false);

    handleRequestRegistered(registerEvent);

    handleAnswerProposed(
      createAnswerProposedEvent(REQUEST_ID, PROPOSER_ID, PROPOSER_ANSWER)
    );

    handleChallengeSubmitted(
      createChallengeSubmittedEvent(
        REQUEST_ID,
        CHALLENGER_ID,
        Bytes.fromUTF8("MY ANSWER"),
        Bytes.fromUTF8("")
      )
    );

    handleReviewSubmitted(
      createReviewSubmittedEvent(
        REQUEST_ID,
        REVIEWER_ID,
        Bytes.fromUTF8("REVIEW"),
        false
      )
    );

    handleRequestResolved(createRequestResolvedEvent(REQUEST_ID, 4));

    handleRewardDistributed(
      createRewardDistributedEvent(
        REQUEST_ID,
        PROPOSER_ID,
        BigInt.fromI64(100000)
      )
    );
    handleRewardDistributed(
      createRewardDistributedEvent(REQUEST_ID, PLATFORM, BigInt.fromI64(100000))
    );
  });
});
