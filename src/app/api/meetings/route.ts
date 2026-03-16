import { NextRequest, NextResponse } from "next/server";
import { ActivityType, Direction, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/session";
import { IS_MOCK, MOCK_MEETINGS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  if (IS_MOCK) return NextResponse.json(MOCK_MEETINGS[studentId] ?? []);

  const meetings = await prisma.meetingNote.findMany({
    where: { studentId },
    orderBy: { meetingDate: "desc" }
  });

  return NextResponse.json(meetings);
}

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || (user.role !== UserRole.COUNSELOR && user.role !== UserRole.ADMIN) || !user.staffId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const meeting = await prisma.meetingNote.create({
    data: {
      studentId: body.studentId,
      counselorId: user.staffId,
      engagementId: body.engagementId,
      pipelineStage: body.pipelineStage,
      meetingDate: new Date(body.meetingDate),
      title: body.title,
      content: body.content
    }
  });

  await prisma.activityLog.create({
    data: {
      studentId: body.studentId,
      staffId: user.staffId,
      type: ActivityType.MEETING,
      direction: Direction.OUTBOUND,
      content: `[Meeting] ${body.title}`,
      pipelineStage: body.pipelineStage
    }
  });

  return NextResponse.json(meeting);
}
