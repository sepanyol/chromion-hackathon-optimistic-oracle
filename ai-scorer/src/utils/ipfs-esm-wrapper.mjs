import { create } from "ipfs-core";

export async function createIpfs() {
  const ipfs = await create({ repo: "./ipfs-repo" });
  console.log("🚀 IPFS node started");
  return ipfs;
}
