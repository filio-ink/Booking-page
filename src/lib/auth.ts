import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      try {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            image: user.image,
            googleAccessToken: account?.access_token,
            googleRefreshToken: account?.refresh_token ?? undefined,
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            googleAccessToken: account?.access_token,
            googleRefreshToken: account?.refresh_token ?? undefined,
          },
        });
        return true;
      } catch {
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, username: true },
        });
        token.userId = dbUser?.id;
        token.username = dbUser?.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.username = token.username as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
};
