import { NextRequest, NextResponse } from "next/server";
import { ProgramType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getDefaultPrice } from "@/lib/pricing";
import { getServerUser } from "@/lib/session";
import { IS_MOCK, MOCK_PROPOSALS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  if (IS_MOCK) return NextResponse.json(MOCK_PROPOSALS[studentId] ?? []);

  const data = await prisma.proposal.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const student = await prisma.contact.findUnique({ where: { id: body.studentId } });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  let isCustomQuote = Boolean(body.isCustomQuote);
  let quoteAmount = body.quoteAmount as number | null;

  if (student.programType !== ProgramType.UNDERGRAD) {
    isCustomQuote = true;
    if (!quoteAmount) {
      return NextResponse.json({ error: "quoteAmount is required for grad/phd" }, { status: 400 });
    }
  }

  if (student.programType === ProgramType.UNDERGRAD && !isCustomQuote && !quoteAmount) {
    quoteAmount = await getDefaultPrice(student.gradeLevel, student.programType);
  }

  const proposal = await prisma.proposal.create({
    data: {
      studentId: body.studentId,
      engagementId: body.engagementId,
      proposalUrl: body.proposalUrl,
      quoteAmount: quoteAmount ?? undefined,
      quoteCurrency: body.quoteCurrency ?? "USD",
      isCustomQuote,
      quoteNotes: body.quoteNotes,
      sentAt: body.sentAt ? new Date(body.sentAt) : null,
      createdById: user.id
    }
  });

  return NextResponse.json(proposal);
}
