import { handler } from "./handler";
import dotenv from "dotenv";
dotenv.config();

handler()
  .catch(console.error)
  .finally(async () => {
    console.log("Finished");
    process.exit(0);
  });
