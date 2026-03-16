import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Minimal config for Edge middleware — no Node.js modules
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },
    // Needed so middleware can read session.user.role from the JWT
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: unknown }).role = token.role;
      }
      return session;
    },
  },
};
