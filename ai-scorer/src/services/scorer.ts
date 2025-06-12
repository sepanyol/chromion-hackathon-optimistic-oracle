import { openai } from "../config/openai";
import { systemPrompt } from "../utils/prompts";
import { resolveUrls } from "./urlResolver";

export async function performScoring(question: string, context: string) {
  const resolved = await resolveUrls(context);
  const prompt = `Question: ${question}\n\nContext: ${resolved}`;
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
  });
  const content = response.choices[0].message?.content ?? "{}";
  return JSON.parse(content);
}
