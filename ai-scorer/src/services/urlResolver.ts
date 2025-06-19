import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export async function resolveUrls(context: string): Promise<string> {
  const urlRegex = /(https?:\/\/[^\s)]+)/g;
  const urls = [...context.matchAll(urlRegex)].map((m) => m[0]);
  let enriched = context;
  for (const url of urls) {
    console.log(`read url ${url}`);
    try {
      const html = await axios
        .get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
          },
        })
        .then((r) => r.data);
      const dom = new JSDOM(html, { url });
      const article = new Readability(dom.window.document).parse();
      enriched += `\n\n[${url}]\n${article?.textContent ?? "No content"}`;
      console.log(`...enriched data from ${url}`);
    } catch (e) {
      enriched += `\n\n[${url}] ERROR: could not load`;
      console.log(`...could not load data from ${url}`);
    }
  }
  return enriched;
}
