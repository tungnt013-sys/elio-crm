import { NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/session";
import { OPEN_STAGES } from "@/lib/stage";
import { IS_MOCK, MOCK_PIPELINE } from "@/lib/mock-data";

export async function GET() {
  if (IS_MOCK) return NextResponse.json(MOCK_PIPELINE);

  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if ((user.role === UserRole.SALES || user.role === UserRole.COUNSELOR) && !user.staffId) {
    return NextResponse.json({ error: "Missing staff profile" }, { status: 400 });
  }

  const where: Prisma.PipelineStageWhereInput =
    user.role === UserRole.SALES || user.role === UserRole.COUNSELOR
      ? { assignedToId: user.staffId!, exitedAt: null }
      : { exitedAt: null };

  const cards = await prisma.pipelineStage.findMany({
    where,
    include: {
      student: { include: { parents: true } },
      assignedTo: true
    },
    orderBy: { enteredAt: "asc" }
  });

  const byStage = Object.fromEntries(OPEN_STAGES.map((stage) => [stage, [] as unknown[]]));
  for (const card of cards) {
    byStage[card.stage].push(card);
  }

  return NextResponse.json(byStage);
}
