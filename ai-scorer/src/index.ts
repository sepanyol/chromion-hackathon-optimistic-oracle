import dotenv from "dotenv";
dotenv.config();

import { Client, cacheExchange, fetchExchange, gql } from "@urql/core";
import { create } from "ipfs-http-client";
import { performScoring } from "./services/scorer";

type Request = {
  scoring: null;
  id: string;
  question: string;
  context: string;
  truthMeaning: string;
};

export const handler = async () => {
  console.log("env vars", process.env);

  const RequestQuery = gql`
    query {
      requests(where: { scoring: null }, first: 1) {
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

  console.log({ dataQuery });

  const { data } = dataQuery;

  if (!data || !data.requests) {
    console.log("no request data", { data });
    return;
  }
  if (!process.env.IPFS_API) throw new Error("env var IPFS_API missing");
  if (!process.env.MFS_PARENT) throw new Error("env var MFS_PARENT missing");

  const ipfs = create({ url: process.env.IPFS_API });

  for (const request of data.requests) {
    console.log(`process request ${request.id}`);

    const filePath = `/${
      process.env.MFS_PARENT
    }/${request.id.toLowerCase()}/data.json`;

    try {
      const exists = await ipfs.files
        .stat(filePath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        const _context = `${request.context} \n${request.truthMeaning}`;
        const result: JSON = await performScoring(request.question, _context);
        const buffer = Buffer.from(JSON.stringify(result, null, 4));

        const { cid } = await ipfs.add(buffer);

        await ipfs.pin.add(cid);

        await ipfs.files.write(filePath, buffer, {
          create: true,
          parents: true,
          truncate: true,
        });

        console.log(
          `✅  file stored and pinned:\nCID: ${cid.toString()}\nPath: ${filePath}`
        );
      } else {
        console.log(`⏭️  already exists for ${request.id}\nPath: ${filePath}`);
      }
    } catch (err) {
      console.error("❌ Error while writing to IPFS:", err);
    }
  }
};

handler()
  .catch(console.error)
  .finally(async () => {
    console.log("Finished");
    process.exit(0);
  });
