import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { IS_MOCK, MOCK_CONTRACTS } from "@/lib/mock-data";

export async function GET() {
  if (IS_MOCK) return NextResponse.json(MOCK_CONTRACTS);

  const data = await prisma.contract.findMany({
    include: {
      student: true,
      payments: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const row = await prisma.contract.create({
    data: {
      studentId: body.studentId,
      contractCode: body.contractCode,
      contractSent: body.contractSent ?? false,
      status: body.status ?? "DRAFT",
      shippingAddress: body.shippingAddress,
      recipientName: body.recipientName,
      recipientPhone: body.recipientPhone,
      shippingCost: body.shippingCost,
      invoiceUrl: body.invoiceUrl,
      notes: body.notes
    }
  });

  return NextResponse.json(row);
}
