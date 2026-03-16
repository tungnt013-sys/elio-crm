import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Number(req.nextUrl.searchParams.get("pageSize") ?? "20");

  let where = {} as Record<string, unknown>;
  if (user.role === UserRole.SALES || user.role === UserRole.COUNSELOR) {
    where = {
      pipelineStages: {
        some: {
          assignedToId: user.staffId,
          exitedAt: null
        }
      }
    };
  } else if (user.role === UserRole.STUDENT && user.contactId) {
    where = { id: user.contactId };
  } else if (user.role === UserRole.PARENT && user.parentId) {
    where = { parents: { some: { id: user.parentId } } };
  }

  const [total, data] = await Promise.all([
    prisma.contact.count({ where }),
    prisma.contact.findMany({
      where,
      include: {
        parents: true,
        pipelineStages: {
          where: { exitedAt: null },
          orderBy: { enteredAt: "desc" },
          take: 1,
          include: { assignedTo: true }
        }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return NextResponse.json({ total, page, pageSize, data });
}
