import { auth } from "@/lib/auth";
import { SessionUser } from "@/types";

export async function getServerUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.email || !session.user.role) {
    return null;
  }

  return {
    id: session.user.id ?? session.user.email,
    email: session.user.email,
    name: session.user.name ?? session.user.email,
    role: session.user.role,
  };
}
