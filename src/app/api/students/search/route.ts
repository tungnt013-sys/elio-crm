import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { IS_MOCK, MOCK_SEARCH_POOL } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json([]);

  if (IS_MOCK) {
    const lq = q.toLowerCase();
    return NextResponse.json(
      MOCK_SEARCH_POOL.filter(
        (s) =>
          s.fullName.toLowerCase().includes(lq) ||
          s.parentName.toLowerCase().includes(lq) ||
          s.email.includes(lq) ||
          s.parentPhone.includes(lq)
      ).slice(0, 8)
    );
  }

  const contacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: { startsWith: q, mode: "insensitive" } },
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { startsWith: q, mode: "insensitive" } },
        {
          parents: {
            some: {
              OR: [
                { fullName: { contains: q, mode: "insensitive" } },
                { phone: { startsWith: q, mode: "insensitive" } }
              ]
            }
          }
        }
      ]
    },
    include: {
      parents: true,
      pipelineStages: {
        where: { exitedAt: null },
        orderBy: { enteredAt: "desc" },
        take: 1
      }
    },
    take: 10
  });

  return NextResponse.json(
    contacts.map((contact) => ({
      id: contact.id,
      fullName: contact.fullName,
      email: contact.email,
      parentName: contact.parents[0]?.fullName ?? null,
      parentPhone: contact.parents[0]?.phone ?? null,
      currentStage: contact.pipelineStages[0]?.stage ?? null,
      programType: contact.programType,
      school: contact.school
    }))
  );
}
