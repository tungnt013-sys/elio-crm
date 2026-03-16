import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerUser } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/users?role=COUNSELOR
// Returns users filtered by role — accessible to any authenticated user
export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = req.nextUrl.searchParams.get("role");
  const query = role ? { role } : {};

  const client = await clientPromise;
  const users = await client
    .db()
    .collection("allowed_users")
    .find(query)
    .sort({ name: 1 })
    .toArray();

  return NextResponse.json(
    users.map(({ _id, ...u }) => ({ id: _id.toString(), name: u.name, email: u.email, role: u.role }))
  );
}
