import { VoyageAIClient } from "voyageai";

// voyage-3-lite: 512-dim, fast, cost-efficient — good for proposal-length text
const MODEL = "voyage-3-lite";

let _client: VoyageAIClient | null = null;

function getClient(): VoyageAIClient {
  if (!_client) {
    const apiKey = process.env.VOYAGE_API_KEY;
    if (!apiKey) throw new Error("VOYAGE_API_KEY environment variable is not set");
    _client = new VoyageAIClient({ apiKey });
  }
  return _client;
}

export async function embed(text: string): Promise<number[]> {
  const result = await getClient().embed({ input: [text], model: MODEL });
  return result.data![0].embedding as number[];
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const result = await getClient().embed({ input: texts, model: MODEL });
  return result.data!.map((d) => d.embedding as number[]);
}
