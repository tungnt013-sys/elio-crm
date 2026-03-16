import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await prisma.payment.findMany({
    where: { contractId: id },
    orderBy: { paymentDate: "desc" }
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const row = await prisma.payment.create({
    data: {
      contractId: id,
      amount: Number(body.amount),
      currency: body.currency,
      paymentDate: new Date(body.paymentDate),
      paymentType: body.paymentType,
      notes: body.notes
    }
  });

  return NextResponse.json(row);
}
