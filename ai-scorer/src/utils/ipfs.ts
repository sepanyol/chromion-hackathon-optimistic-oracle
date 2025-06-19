import type { IPFS } from "ipfs-core";

let ipfsInstance: IPFS | null = null;

export interface StoreResult {
  fileCid: string;
  folderCid: string;
  ipfsPath: string;
}

// initializes ipfs node
export async function getIpfsInstance(): Promise<IPFS> {
  console.log({ ipfsInstance });
  if (!ipfsInstance) {
    const { createIpfs } = await import("./ipfs-esm-wrapper.mjs");
    ipfsInstance = await createIpfs();
    console.log("🚀 IPFS node started");
  }
  return ipfsInstance;
}

export async function storeJsonObjectInMfs(
  jsonObject: Record<string, any>,
  mfsSubfolderName: string,
  mfsParent: string
): Promise<StoreResult> {
  console.log("storeJsonObjectInMfs", {
    mfsSubfolderName,
    mfsParent,
  });
  const ipfs = await getIpfsInstance();

  const jsonBuffer = Buffer.from(JSON.stringify(jsonObject, null, 4), "utf-8");
  const targetDir = `${mfsParent}/${mfsSubfolderName}`;
  const targetFile = `${targetDir}/data.json`;

  try {
    await ipfs.files.stat(targetDir);
  } catch {
    await ipfs.files.mkdir(targetDir, { parents: true });
    console.log(`📁 folder created in MFS: ${targetDir}`);
  }

  await ipfs.files.write(targetFile, jsonBuffer, {
    create: true,
    truncate: true,
  });
  console.log(`✅ file written to: ${targetFile}`);

  const fileStat = await ipfs.files.stat(targetFile);
  const parentStat = await ipfs.files.stat(mfsParent);

  const fileCid = fileStat.cid.toString();
  const folderCid = parentStat.cid.toString();
  const ipfsPath = `${folderCid}/${fileCid}`;

  console.log(`📦 CID of file: ${fileCid}`);
  console.log(`📁 CID of ${mfsParent}: ${folderCid}`);
  console.log(`🚀 IPFS path: ${ipfsPath}`);

  return {
    fileCid,
    folderCid,
    ipfsPath,
  };
}
