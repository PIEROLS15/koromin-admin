import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Adapter, AdapterAccount, AdapterUser } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

import { prisma } from "@/lib/prisma/client";

function korominPrismaAdapter(): Adapter {
  const adapter = PrismaAdapter(prisma) as Adapter;

  return {
    ...adapter,
    async createUser(user: Omit<AdapterUser, "id">) {
      const created = await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          image: user.image,
        },
      });

      return { ...created, emailVerified: null } as AdapterUser;
    },
    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email ?? undefined,
          name: user.name,
          image: user.image,
        },
      });

      return { ...updated, emailVerified: null } as AdapterUser;
    },
    async getUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      return user ? ({ ...user, emailVerified: null } as AdapterUser) : null;
    },
    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      return user ? ({ ...user, emailVerified: null } as AdapterUser) : null;
    },
    async getUserByAccount(providerAccountId: Pick<AdapterAccount, "provider" | "providerAccountId">) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: providerAccountId },
        include: { user: true },
      });

      return account?.user ? ({ ...account.user, emailVerified: null } as AdapterUser) : null;
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: korominPrismaAdapter(),
  session: { strategy: "database" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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
      const users = await prisma.user.count();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          role: users <= 1 ? "ADMIN" : undefined,
        },
      });
    },
  },
  pages: {
    signIn: "/login",
  },
};
