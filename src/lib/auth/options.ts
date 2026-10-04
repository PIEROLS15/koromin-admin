import "server-only";

import { Prisma } from "@prisma/client";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

import { korominPrismaAdapter } from "@/lib/auth/adapter";
import { requiredServerEnv } from "@/lib/env/server";
import { prisma } from "@/lib/prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: korominPrismaAdapter(),
  session: { strategy: "database" },
  providers: [
    GoogleProvider({
      clientId: requiredServerEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requiredServerEnv("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, status: true },
        });
        session.user.id = user.id;
        session.user.role = dbUser?.role ?? "VISITOR";
        session.user.status = dbUser?.status ?? "ACTIVE";
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.email) return;
      await prisma.$transaction(async (tx) => {
        const admins = await tx.user.count({ where: { role: "ADMIN" } });
        await tx.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            role: admins === 0 ? "ADMIN" : undefined,
          },
        });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    },
  },
  pages: {
    signIn: "/login",
  },
};
