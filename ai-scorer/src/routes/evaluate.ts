import express, { Request, Response, Router } from "express";
import { performScoring } from "../services/scorer";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { question, context } = req.body;

  if (!question || !context) {
    res.status(400).json({ error: "Missing question or context." });
    return;
  }

  try {
    const result = await performScoring(question, context);
    res.json(result);
  } catch (err) {
    console.error("❌ Error while scoring:", err);
    res.status(500).json({ error: "Scoring failed." });
  }
});

export default router;
