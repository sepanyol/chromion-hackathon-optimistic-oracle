import { handler } from "./handler";
import dotenv from "dotenv";
dotenv.config();

let running = true;

process.on("SIGINT", () => {
  console.log("\nWatcher aborted by user.");
  process.exit(0);
});

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function task() {
  console.log("Running task at", new Date().toISOString());
  return await handler();
}

async function startWatcher() {
  try {
    while (running) {
      await task();
      if (running) {
        console.log("wait for 30s");
        await sleep(60000); // wait for 60s
      }
    }
    console.log("Watcher stopped.");
  } catch (err) {
    console.error("Watcher error:", err);
  }
}

startWatcher();
