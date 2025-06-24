import dotenv from "dotenv";
dotenv.config();

import { Client, cacheExchange, fetchExchange, gql } from "@urql/core";
import {
  Abi,
  Address,
  createPublicClient,
  createWalletClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalanche, avalancheFuji } from "viem/chains";
import abi from "./abis/RequestScoringRegistry.json";
import { performScoring } from "./services/scorer";

type Request = {
  scoring: null;
  id: string;
  question: string;
  context: string;
  truthMeaning: string;
};

const isTestnet = Boolean(parseInt(`${process.env.IS_TESTNET}`));
const chain = isTestnet ? avalancheFuji : avalanche;
const rpcUrl = isTestnet
  ? `${process.env.AVALANCHE_FUJI_RPC_URL}`
  : `${process.env.AVALANCHE_RPC_URL}`;
const SCORING_REGISTRY_ADDERSS =
  `${process.env.SCORING_REGISTRY_ADDRESS}` as Address;

export const handler = async () => {
  const RequestQuery = gql`
    query {
      requests(where: { scoring: null }, first: 10) {
        scoring {
          id
        }
        id
        question
        context
        truthMeaning
      }
    }
  `;

  console.log("Init supgraph client");
  const client = new Client({
    url: `${process.env.SUBGRAPH_API}`,
    exchanges: [cacheExchange, fetchExchange],
  });

  console.log("query supgraph");
  const dataQuery = await client.query<{ requests: Request[] }>(
    RequestQuery,
    {}
  );

  const { data } = dataQuery;

  if (!data || !data.requests) {
    console.log("no request data", { data });
    return;
  }

  console.log(`processing ${data.requests.length} request(s)`);

  const publicCLient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const batchData: { addy: Address; score: Address }[] = [];
  for (const request of data.requests) {
    console.log(`process request ${request.id}`);

    const exists = await publicCLient
      .readContract({
        address: SCORING_REGISTRY_ADDERSS,
        abi: abi as Abi,
        functionName: "getScoring",
        args: [request.id],
      })
      .then((response: any) => Boolean(response.final_decision))
      .catch(() => false);

    if (exists) {
      console.log("Scoring already exists");
      continue;
    }

    const context = `${request.context} \n${request.truthMeaning}`;
    const result = await performScoring(request.question, context);

    const scoringBytes16 = Buffer.from(
      [
        result.score,
        result.final_decision,
        result.heatmap.ambiguity,
        result.heatmap.clarity,
        result.heatmap.completeness,
        result.heatmap.logical_consistency,
        result.heatmap.source_trust,
        result.heatmap.time_reference,
        Math.floor(result.ratings.ambiguity / 0.25),
        Math.floor(result.ratings.clarity / 0.25),
        Math.floor(result.ratings.completeness / 0.25),
        Math.floor(result.ratings.logical_consistency / 0.25),
        Math.floor(result.ratings.source_trust / 0.25),
        Math.floor(result.ratings.time_reference / 0.25),
        0,
        0,
      ].reverse()
    ).toString("hex");

    batchData.push({
      addy: request.id as Address,
      score: `0x${scoringBytes16}`,
    });
  }

  if (!batchData.length) {
    console.log("nothing to store on-chain");
    return;
  }

  console.log(`${batchData.length} will be saved on-chain`);

  const account = privateKeyToAccount(`${process.env.PRIVATE_KEY}` as Address);

  console.log(`Simulate`);

  const { request, result } = await publicCLient.simulateContract({
    account,
    address: SCORING_REGISTRY_ADDERSS,
    abi: abi as Abi,
    functionName: "batch",
    args: [
      batchData.map(({ addy }) => addy),
      batchData.map(({ score }) => score),
    ],
  });

  if (result) {
    console.error("Not able to perform on-chain request", { result });
    return;
  }
  console.log(`all good`);

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(`${process.env.AVALANCHE_FUJI_RPC_URL}`),
  });
  console.log(`write on-chain`);
  const hash = await walletClient.writeContract(request);
  console.log(`wait for tx ${hash}`);
  const txReceipt = await publicCLient.waitForTransactionReceipt({ hash });
  console.log("tx finished", { txReceipt });
  return;
};
