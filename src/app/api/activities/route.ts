import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/session";
import { IS_MOCK, MOCK_ACTIVITIES } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  if (IS_MOCK) return NextResponse.json(MOCK_ACTIVITIES[studentId] ?? []);

  const rows = await prisma.activityLog.findMany({
    where: { studentId },
    include: { staff: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user?.staffId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const activity = await prisma.activityLog.create({
    data: {
      studentId: body.studentId,
      staffId: user.staffId,
      type: body.type,
      direction: body.direction,
      content: body.content,
      pipelineStage: body.pipelineStage
    }
  });

  await prisma.contact.update({
    where: { id: body.studentId },
    data: { lastContactedAt: activity.createdAt }
  });

  await prisma.contact.updateMany({
    where: { id: body.studentId, firstContactedAt: null },
    data: { firstContactedAt: activity.createdAt }
  });

  return NextResponse.json(activity);
}
