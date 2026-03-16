import { NextRequest, NextResponse } from "next/server";
import { ProgramType, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/session";

export async function GET() {
  const data = await prisma.pricingConfig.findMany({ orderBy: { gradeLevel: "asc" } });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const user = await getServerUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.pricingConfig.update({
    where: { gradeLevel_programType: { gradeLevel: body.gradeLevel, programType: ProgramType.UNDERGRAD } },
    data: { price: Number(body.price), updatedById: user.id, isActive: true }
  });

  return NextResponse.json(updated);
}
