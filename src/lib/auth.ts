import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import clientPromise from "@/lib/mongodb";
import type { UserRole } from "@/lib/roles";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const client = await clientPromise;
      const allowed = await client.db().collection("allowed_users").findOne({ email: user.email });
      return !!allowed;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const client = await clientPromise;
        const allowed = await client.db().collection("allowed_users").findOne({ email: user.email });
        token.role = (allowed?.role as UserRole) ?? "PENDING";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.sub ?? "";
      }
      return session;
    },
  },
});
