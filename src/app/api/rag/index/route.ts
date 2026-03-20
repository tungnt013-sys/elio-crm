import { NextRequest, NextResponse } from "next/server";
import { indexSectionBatch, type SectionType, type ProposalSectionDoc } from "@/lib/proposal-rag";
import { getServerUser } from "@/lib/session";

interface SectionInput {
  sectionType: SectionType;
  content: string;
  metadata?: ProposalSectionDoc["metadata"];
}

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const sections: SectionInput[] = body.sections;

  if (!Array.isArray(sections) || sections.length === 0) {
    return NextResponse.json({ error: "sections array is required" }, { status: 400 });
  }

  try {
    await indexSectionBatch(
      sections.map((s) => ({
        sectionType: s.sectionType,
        content: s.content,
        metadata: s.metadata ?? {},
        source: "finalized" as const,
        approvedAt: new Date(),
      })),
    );

    return NextResponse.json({ indexed: sections.length });
  } catch (err) {
    console.error("[RAG index]", err);
    return NextResponse.json({ error: "Indexing failed" }, { status: 500 });
  }
}
