import {
  AnyVariables,
  cacheExchange,
  Client,
  DocumentInput,
  fetchExchange,
  OperationContext,
} from "urql";

const clientCache: { [key: string]: Client } = {};

export const urqlClient = (url: string) => {
  if (clientCache[url]) return clientCache[url];

  clientCache[url] = new Client({
    url: url,
    exchanges: [cacheExchange, fetchExchange],
  });

  return clientCache[url];
};

export const querySubgraph = async (
  query: DocumentInput,
  variables: AnyVariables,
  context?: Partial<OperationContext>
) =>
  await urqlClient(`${process.env.NEXT_PUBLIC_SUBGRAPH_API}`).query(
    query,
    variables,
    context
  );
