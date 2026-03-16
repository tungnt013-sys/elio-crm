import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerUser } from "@/lib/session";

export async function GET() {
  const user = await getServerUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = await clientPromise;
  const users = await client.db().collection("allowed_users").find({}).sort({ email: 1 }).toArray();
  return NextResponse.json(users.map(({ _id, ...u }) => ({ ...u, id: _id.toString() })));
}

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { email, role, name } = body;
  if (!email || !role) return NextResponse.json({ error: "email and role required" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db();
  const existing = await db.collection("allowed_users").findOne({ email });
  if (existing) return NextResponse.json({ error: "User already exists" }, { status: 409 });

  const result = await db.collection("allowed_users").insertOne({ email, role, name: name || email });
  return NextResponse.json({ id: result.insertedId.toString(), email, role, name: name || email });
}
