import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await params;
  const { role, name } = await req.json();
  const client = await clientPromise;
  const update: Record<string, string> = {};
  if (role) update.role = role;
  if (name) update.name = name;

  await client.db().collection("allowed_users").updateOne(
    { email: decodeURIComponent(email) },
    { $set: update }
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await params;
  const client = await clientPromise;
  await client.db().collection("allowed_users").deleteOne({ email: decodeURIComponent(email) });
  return NextResponse.json({ ok: true });
}
