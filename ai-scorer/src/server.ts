import express from "express";
import dotenv from "dotenv";
import evaluateRouter from "./routes/evaluate";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/evaluate", evaluateRouter);

app.listen(PORT, () => {
  console.log(`✅ AI Scoring Server running @ http://localhost:${PORT}`);
});
