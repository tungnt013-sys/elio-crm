import { NextResponse } from "next/server";
import { getCorpusStats } from "@/lib/proposal-rag";

export async function GET() {
  try {
    const stats = await getCorpusStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("[RAG stats]", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
