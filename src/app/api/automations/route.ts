import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/session";

export async function GET() {
  const data = await prisma.emailAutomationRule.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const row = await prisma.emailAutomationRule.create({
    data: {
      name: body.name,
      triggerStage: body.triggerStage,
      delayHours: body.delayHours,
      condition: body.condition,
      recipientRole: body.recipientRole,
      ccEmails: body.ccEmails ?? [],
      emailSubject: body.emailSubject,
      emailBody: body.emailBody,
      isActive: body.isActive ?? true,
      createdById: user.id
    }
  });

  return NextResponse.json(row);
}
