import "server-only";

import { prisma } from "@/lib/prisma/client";

export async function getUserList() {
  return prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      image: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}
