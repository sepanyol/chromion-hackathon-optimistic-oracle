import { openai } from "../config/openai";
import { systemPrompt } from "../utils/prompts";
import { resolveUrls } from "./urlResolver";

type RequestScoring = {
  score: number;
  heatmap: {
    clarity: number;
    logical_consistency: number;
    completeness: number;
    source_trust: number;
    ambiguity: number;
    time_reference: number;
  };
  ratings: {
    clarity: number;
    logical_consistency: number;
    completeness: number;
    source_trust: number;
    ambiguity: number;
    time_reference: number;
  };
  final_decision: number;
};

export async function performScoring(
  question: string,
  context: string
): Promise<RequestScoring> {
  const resolved = await resolveUrls(context);
  console.log(`...perform scoring`);
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
  console.log(`...received scoring`);
  return JSON.parse(content) as RequestScoring;
}
