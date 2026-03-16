import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user || (user.role !== UserRole.COUNSELOR && user.role !== UserRole.ADMIN) || !user.staffId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const row = await prisma.meetingNote.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.role === UserRole.COUNSELOR && row.counselorId !== user.staffId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.meetingNote.update({
    where: { id },
    data: {
      title: body.title,
      content: body.content,
      meetingDate: body.meetingDate ? new Date(body.meetingDate) : undefined
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user || (user.role !== UserRole.COUNSELOR && user.role !== UserRole.ADMIN) || !user.staffId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const row = await prisma.meetingNote.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.role === UserRole.COUNSELOR && row.counselorId !== user.staffId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.meetingNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
