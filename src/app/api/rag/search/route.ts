import { NextRequest, NextResponse } from "next/server";
import { searchSimilar, type SectionType } from "@/lib/proposal-rag";

const VALID_TYPES: SectionType[] = ["section1", "section2", "section3"];

export async function GET(req: NextRequest) {
  const sectionType = req.nextUrl.searchParams.get("sectionType") as SectionType | null;
  const query = req.nextUrl.searchParams.get("query");

  if (!sectionType || !VALID_TYPES.includes(sectionType)) {
    return NextResponse.json(
      { error: "sectionType must be one of: section1, section2, section3" },
      { status: 400 },
    );
  }
  if (!query?.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  try {
    const results = await searchSimilar(sectionType, query, 2);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[RAG search]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
