// src/index.ts
import dotenv2 from "dotenv";
import { Client, cacheExchange, fetchExchange, gql } from "@urql/core";
import {
  createPublicClient,
  createWalletClient,
  http
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalanche, avalancheFuji } from "viem/chains";

// src/abis/RequestScoringRegistry.json
var RequestScoringRegistry_default = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "batch",
    inputs: [
      {
        name: "_address",
        type: "address[]",
        internalType: "address[]"
      },
      {
        name: "_scoring",
        type: "bytes16[]",
        internalType: "bytes16[]"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getScoring",
    inputs: [
      {
        name: "_address",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [
      {
        name: "_scoring",
        type: "tuple",
        internalType: "struct IRequestScoringRegistry.RequestScoring",
        components: [
          {
            name: "score",
            type: "uint8",
            internalType: "uint8"
          },
          {
            name: "heatmap",
            type: "tuple",
            internalType: "struct IRequestScoringRegistry.RequestScoringHeatmap",
            components: [
              {
                name: "clarity",
                type: "uint8",
                internalType: "uint8"
              },
              {
                name: "logical_consistency",
                type: "uint8",
                internalType: "uint8"
              },
              {
                name: "completeness",
                type: "uint8",
                internalType: "uint8"
              },
              {
                name: "source_trust",
                type: "uint8",
                internalType: "uint8"
              },
              {
                name: "ambiguity",
                type: "uint8",
                internalType: "uint8"
              },
              {
                name: "time_reference",
                type: "uint8",
                internalType: "uint8"
              }
            ]
          },
          {
            name: "ratings",
            type: "tuple",
            internalType: "struct IRequestScoringRegistry.RequestScoringRatings",
            components: [
              {
                name: "clarity",
                type: "uint8",
                internalType: "uint8"
              },
              {
                name: "logical_consistency",
                type: "uint8",
                internalType: "uint8"
              },
              {
                name: "completeness",
                type: "uint8",
                internalType: "uint8"
              },
              {
                name: "source_trust",
                type: "uint8",
                internalType: "uint8"
              },
              {
                name: "ambiguity",
                type: "uint8",
                internalType: "uint8"
              },
              {
                name: "time_reference",
                type: "uint8",
                internalType: "uint8"
              }
            ]
          },
          {
            name: "final_decision",
            type: "uint8",
            internalType: "uint8"
          }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address"
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address"
      }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "AddedScoring",
    inputs: [
      {
        name: "request",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "scoring",
        type: "bytes16",
        indexed: false,
        internalType: "bytes16"
      }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address"
      }
    ],
    anonymous: false
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address"
      }
    ]
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address"
      }
    ]
  }
];

// src/config/openai.ts
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// src/utils/prompts.ts
var systemPrompt = `
You are an evaluation module within a Model Context Protocol (MCP) server.  
Your task is to assess how likely it is that people would disagree with an answer given to a specific question,  
based solely on the provided context. You must not use any external knowledge \u2014 only the input context is allowed. 
Check if given resources can be trusted in general and are proper resources to be able to answer a question.

Return your evaluation in the following strict JSON format:

{
  "score": number,                // Overall score from 1 (very likely disagreement) to 100 (very unlikely)
  "heatmap": {
    "clarity": number,            // 1-100: Is the question and context clearly expressed?
    "logical_consistency": number,// 1-100: Are all rules and conditions logically sound and consistent?
    "completeness": number,       // 1-100: Is all necessary information included to answer reliably?
    "source_trust": number,       // 1-100: How trustworthy and clearly defined is the source?
    "ambiguity": number,          // 1-100: How ambiguous is the context? (100 = no ambiguity)
    "time_reference": number      // 1-100: Are timeframes, deadlines, or conditions well defined?
  },
  "ratings": {
    "clarity": number,            // 1-5 stars, derived from the heatmap values
    "logical_consistency": number,
    "completeness": number,
    "source_trust": number,
    "ambiguity": number,
    "time_reference": number
  },
  "final_decision": 1 | 2 | 3     // 1 = confident, 2 = moderate, 3 = uncertain"
}

Your output must be valid JSON. Do not include any explanation or commentary.
`;

// src/services/urlResolver.ts
import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
async function resolveUrls(context) {
  const urlRegex = /(https?:\/\/[^\s)]+)/g;
  const urls = [...context.matchAll(urlRegex)].map((m) => m[0]);
  let enriched = context;
  for (const url of urls) {
    console.log(`read url ${url}`);
    try {
      const html = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
        }
      }).then((r) => r.data);
      const dom = new JSDOM(html, { url });
      const article = new Readability(dom.window.document).parse();
      enriched += `

[${url}]
${article?.textContent ?? "No content"}`;
      console.log(`...enriched data from ${url}`);
    } catch (e) {
      enriched += `

[${url}] ERROR: could not load`;
      console.log(`...could not load data from ${url}`);
    }
  }
  return enriched;
}

// src/services/scorer.ts
async function performScoring(question, context) {
  const resolved = await resolveUrls(context);
  console.log(`...perform scoring`);
  const prompt = `Question: ${question}

Context: ${resolved}`;
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  });
  const content = response.choices[0].message?.content ?? "{}";
  console.log(`...received scoring`);
  return JSON.parse(content);
}

// src/index.ts
dotenv2.config();
var isTestnet = Boolean(parseInt(`${process.env.IS_TESTNET}`));
var chain = isTestnet ? avalancheFuji : avalanche;
var SCORING_REGISTRY_ADDERSS = `${process.env.SCORING_REGISTRY_ADDRESS}`;
var handler = async () => {
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
    exchanges: [cacheExchange, fetchExchange]
  });
  console.log("query supgraph");
  const dataQuery = await client.query(
    RequestQuery,
    {}
  );
  console.log({ dataQuery });
  const { data } = dataQuery;
  if (!data || !data.requests) {
    console.log("no request data", { data });
    return;
  }
  const publicCLient = createPublicClient({
    chain,
    transport: http(`${process.env.AVALANCHE_FUJI_RPC_URL}`)
  });
  const batchData = [];
  for (const request2 of data.requests) {
    console.log(`process request ${request2.id}`);
    const exists = await publicCLient.readContract({
      address: SCORING_REGISTRY_ADDERSS,
      abi: RequestScoringRegistry_default,
      functionName: "getScoring",
      args: [request2.id]
    }).then((response) => Boolean(response.final_decision)).catch(() => false);
    if (exists) {
      console.log("Scoring already exists");
      continue;
    }
    const context = `${request2.context} 
${request2.truthMeaning}`;
    const result2 = await performScoring(request2.question, context);
    const scoringBytes16 = Buffer.from(
      [
        result2.score,
        result2.final_decision,
        result2.heatmap.ambiguity,
        result2.heatmap.clarity,
        result2.heatmap.completeness,
        result2.heatmap.logical_consistency,
        result2.heatmap.source_trust,
        result2.heatmap.time_reference,
        Math.floor(result2.ratings.ambiguity / 0.25),
        Math.floor(result2.ratings.clarity / 0.25),
        Math.floor(result2.ratings.completeness / 0.25),
        Math.floor(result2.ratings.logical_consistency / 0.25),
        Math.floor(result2.ratings.source_trust / 0.25),
        Math.floor(result2.ratings.time_reference / 0.25),
        0,
        0
      ].reverse()
    ).toString("hex");
    batchData.push({
      addy: request2.id,
      score: `0x${scoringBytes16}`
    });
  }
  if (!batchData.length) {
    console.log("nothing to store on-chain");
    return;
  }
  console.log(`${batchData.length} will be saved on-chain`);
  const account = privateKeyToAccount(`${process.env.PRIVATE_KEY}`);
  console.log(`Simulate`);
  const { request, result } = await publicCLient.simulateContract({
    account,
    address: SCORING_REGISTRY_ADDERSS,
    abi: RequestScoringRegistry_default,
    functionName: "batch",
    args: [
      batchData.map(({ addy }) => addy),
      batchData.map(({ score }) => score)
    ]
  });
  if (result) {
    console.error("Not able to perform on-chain request", { result });
    return;
  }
  console.log(`all good`);
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(`${process.env.AVALANCHE_FUJI_RPC_URL}`)
  });
  console.log(`write on-chain`);
  const hash = await walletClient.writeContract(request);
  console.log(`wait for tx ${hash}`);
  const txReceipt = await publicCLient.waitForTransactionReceipt({ hash });
  console.log("tx finished", { txReceipt });
  return;
};
handler().catch(console.error).finally(async () => {
  console.log("Finished");
  process.exit(0);
});
export {
  handler
};
