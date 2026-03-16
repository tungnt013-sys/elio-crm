import { NextRequest, NextResponse } from "next/server";
import { ContractStatus, EngagementStatus, LossReason, Stage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/session";
import { LOSS_STAGES } from "@/lib/stage";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id } = await params;
  const targetStage = body.stage as Stage;
  const lossReason = body.lossReason as LossReason | undefined;

  if (LOSS_STAGES.has(targetStage) && !lossReason) {
    return NextResponse.json({ error: "lossReason is required" }, { status: 400 });
  }

  const current = await prisma.pipelineStage.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.pipelineStage.update({ where: { id }, data: { exitedAt: new Date() } });

  const next = await prisma.pipelineStage.create({
    data: {
      studentId: current.studentId,
      stage: targetStage,
      picType: body.picType ?? current.picType,
      assignedToId: body.assignedToId ?? current.assignedToId,
      changedById: user.id,
      enteredAt: new Date(),
      lossReason,
      lossReasonDetail: body.lossReasonDetail,
      notes: body.notes
    }
  });

  if (targetStage === Stage.S10) {
    const student = await prisma.contact.findUnique({ where: { id: current.studentId } });
    if (student) {
      const engagement = await prisma.programEngagement.create({
        data: {
          studentId: student.id,
          counselorId: current.assignedToId,
          programType: student.programType,
          targetIntake: student.expectedStart ?? "TBD",
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          status: EngagementStatus.ACTIVE
        }
      });

      await prisma.milestone.createMany({
        data: [
          { engagementId: engagement.id, monthLabel: "Month 1", order: 1 },
          { engagementId: engagement.id, monthLabel: "Month 2", order: 2 },
          { engagementId: engagement.id, monthLabel: "Month 3", order: 3 }
        ]
      });

      await prisma.contract.create({
        data: {
          studentId: student.id,
          contractCode: `${Date.now()}-ELIO`,
          status: ContractStatus.DRAFT
        }
      });
    }
  }

  return NextResponse.json(next);
}
