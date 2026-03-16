import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Minimal config for Edge middleware — no Node.js modules
export const authConfig: NextAuthConfig = {
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
  },
};
