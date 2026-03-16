import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import clientPromise from "@/lib/mongodb";
import type { UserRole } from "@/lib/roles";

const DEV_USERS = [
  { email: "tung@elio.education",    name: "Tùng",   role: "ADMIN" as UserRole },
  { email: "duc@elio.education",     name: "Đức",    role: "ADMIN" as UserRole },
  { email: "phuong@elio.education",  name: "Phương", role: "ADMIN" as UserRole },
  { email: "hang.nm@elio.education", name: "Hằng",   role: "SALES" as UserRole },
  { email: "chi.tm@elio.education",  name: "Chi",    role: "SALES_VIEW" as UserRole },
];

const devProvider = process.env.NEXT_PUBLIC_DEV_LOGIN === "true"
  ? [Credentials({
      id: "dev",
      name: "Dev Login",
      credentials: { email: { label: "Email", type: "text" } },
      authorize(credentials) {
        const u = DEV_USERS.find((d) => d.email === credentials?.email);
        return u ? { id: u.email, email: u.email, name: u.name } : null;
      },
    })]
  : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [...(authConfig.providers ?? []), ...devProvider],
  callbacks: {
    async signIn({ user, account }) {
      // Dev credentials bypass — skip DB check
      if (account?.provider === "dev") return true;
      if (!user.email) return false;
      const client = await clientPromise;
      const allowed = await client.db().collection("allowed_users").findOne({ email: user.email });
      return !!allowed;
    },
    async jwt({ token, user, account }) {
      if (user?.email) {
        // Dev credentials — role comes from DEV_USERS list
        if (account?.provider === "dev") {
          const u = DEV_USERS.find((d) => d.email === user.email);
          token.role = u?.role ?? "ADMIN";
        } else {
          const client = await clientPromise;
          const allowed = await client.db().collection("allowed_users").findOne({ email: user.email });
          token.role = (allowed?.role as UserRole) ?? "PENDING";
        }
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
