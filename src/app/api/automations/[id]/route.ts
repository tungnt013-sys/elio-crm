import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await prisma.emailAutomationRule.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const row = await prisma.emailAutomationRule.update({
    where: { id },
    data: {
      name: body.name,
      triggerStage: body.triggerStage,
      delayHours: body.delayHours,
      condition: body.condition,
      recipientRole: body.recipientRole,
      ccEmails: body.ccEmails,
      emailSubject: body.emailSubject,
      emailBody: body.emailBody,
      isActive: body.isActive
    }
  });

  return NextResponse.json(row);
}
