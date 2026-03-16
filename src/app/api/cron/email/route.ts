import { NextResponse } from "next/server";
import { AutomationCondition, JobStatus, Stage } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();

  const rules = await prisma.emailAutomationRule.findMany({ where: { isActive: true } });

  for (const rule of rules) {
    const studentsInStage = await prisma.pipelineStage.findMany({
      where: {
        stage: rule.triggerStage,
        exitedAt: null,
        enteredAt: {
          lte: new Date(now.getTime() - rule.delayHours * 3600 * 1000)
        }
      },
      include: {
        student: true,
        assignedTo: true
      }
    });

    for (const stage of studentsInStage) {
      const existingJob = await prisma.scheduledEmailJob.findFirst({
        where: {
          ruleId: rule.id,
          studentId: stage.studentId,
          status: JobStatus.PENDING
        }
      });
      if (existingJob) {
        continue;
      }

      let met = true;
      if (rule.condition === AutomationCondition.NO_ACTIVITY) {
        const recent = await prisma.activityLog.findFirst({
          where: { studentId: stage.studentId },
          orderBy: { createdAt: "desc" }
        });
        if (recent && recent.createdAt > new Date(now.getTime() - rule.delayHours * 3600 * 1000)) {
          met = false;
        }
      }
      if (rule.condition === AutomationCondition.STILL_IN_STAGE && stage.stage !== rule.triggerStage) {
        met = false;
      }

      const job = await prisma.scheduledEmailJob.create({
        data: {
          ruleId: rule.id,
          studentId: stage.studentId,
          scheduledFor: now,
          status: met ? JobStatus.PENDING : JobStatus.CONDITION_NOT_MET,
          cancelledReason: met ? null : "Condition not met"
        }
      });

      if (!met) {
        continue;
      }

      await sendEmail({
        to: [stage.assignedTo.email],
        cc: rule.ccEmails,
        subject: rule.emailSubject
          .replace("{{student_name}}", stage.student.fullName)
          .replace("{{stage_name}}", stage.stage),
        html: `<p>${rule.emailBody
          .replace("{{student_name}}", stage.student.fullName)
          .replace("{{counselor_name}}", stage.assignedTo.name)
          .replace("{{stage_name}}", stage.stage)
          .replace("{{days_elapsed}}", String(Math.ceil((now.getTime() - stage.enteredAt.getTime()) / (24 * 3600 * 1000))))}</p>`
      });

      await prisma.scheduledEmailJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.SENT,
          sentAt: new Date()
        }
      });
    }
  }

  await prisma.scheduledEmailJob.updateMany({
    where: {
      status: JobStatus.PENDING,
      student: {
        pipelineStages: {
          some: {
            stage: { notIn: [Stage.S6, Stage.S8] },
            exitedAt: null
          }
        }
      }
    },
    data: {
      status: JobStatus.CANCELLED,
      cancelledReason: "Stage changed"
    }
  });

  return NextResponse.json({ ok: true, now: now.toISOString() });
}
