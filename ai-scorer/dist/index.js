// src/index.ts
import { Client, cacheExchange, fetchExchange, gql } from "@urql/core";
import { create } from "ipfs-http-client";

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
  "final_decision": "confident" | "moderate" | "uncertain"
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
import dotenv2 from "dotenv";
dotenv2.config();
var handler = async () => {
  const RequestQuery = gql`
    query {
      requests(where: { scoring: null }) {
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
  const client = new Client({
    url: `${process.env.SUBGRAPH_API}`,
    exchanges: [cacheExchange, fetchExchange]
  });
  const { data } = await client.query(
    RequestQuery,
    {}
  );
  if (!data || !data.requests) return;
  if (!!process.env.IPFS_API) throw new Error("env var IPFS_API missing");
  if (!!process.env.MFS_PARENT) throw new Error("env var MFS_PARENT missing");
  const ipfs = create({ url: process.env.IPFS_API });
  for (const request of data.requests) {
    console.log(`process request ${request.id}`);
    const _context = `${request.context} 
${request.truthMeaning}`;
    const result = await performScoring(request.question, _context);
    const filePath = `/${process.env.MFS_PARENT}/${request.id.toLowerCase()}/data.json`;
    const buffer = Buffer.from(JSON.stringify(result, null, 4));
    try {
      const exists = await ipfs.files.stat(filePath).then(() => true).catch(() => false);
      if (!exists) {
        const { cid } = await ipfs.add(buffer);
        await ipfs.pin.add(cid);
        await ipfs.files.write(filePath, buffer, {
          create: true,
          parents: true,
          truncate: true
        });
        console.log(
          `\u2705 file stored and pinned:
CID: ${cid.toString()}
Path: ${filePath}`
        );
      } else {
        console.log(`\u23ED\uFE0F already exists for ${request.id}`);
      }
    } catch (err) {
      console.error("\u274C Error while writing to IPFS:", err);
    }
  }
};
handler().catch(console.error).finally(async () => {
  console.log("Finished");
  process.exit(0);
});
export {
  handler
};
