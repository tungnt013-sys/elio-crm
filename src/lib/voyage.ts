// Google text-embedding-004: 768-dim, multilingual, free via Generative Language API
const MODEL = "text-embedding-004";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function getApiKey(): string {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("GOOGLE_API_KEY environment variable is not set");
  return key;
}

export async function embed(text: string): Promise<number[]> {
  const key = getApiKey();
  const res = await fetch(`${API_BASE}/${MODEL}:embedContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: { parts: [{ text }] } }),
  });
  if (!res.ok) throw new Error(`Google embedding error: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.embedding.values as number[];
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map(embed));
}
