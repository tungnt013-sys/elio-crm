import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/session";
import { IS_MOCK, MOCK_STUDENTS } from "@/lib/mock-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (IS_MOCK) {
    const student = MOCK_STUDENTS[id];
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(student);
  }

  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const student = await prisma.contact.findUnique({
    where: { id },
    include: {
      parents: true,
      pipelineStages: { orderBy: { enteredAt: "desc" }, include: { assignedTo: true } },
      activityLogs: { orderBy: { createdAt: "desc" }, take: 50, include: { staff: true } },
      meetingNotes: { orderBy: { meetingDate: "desc" }, include: { counselor: true } },
      proposals: { orderBy: { createdAt: "desc" }, include: { createdBy: true } },
      engagements: { include: { milestones: { include: { tasks: true } } } },
      documents: { orderBy: { uploadedAt: "desc" } }
    }
  });

  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.contact.update({
    where: { id },
    data: {
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      school: body.school,
      salesRunningNotes: body.salesRunningNotes,
      targetSchools: body.targetSchools,
      expectedStart: body.expectedStart
    }
  });

  return NextResponse.json(updated);
}
