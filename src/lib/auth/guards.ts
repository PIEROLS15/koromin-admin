import "server-only";

import type { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/options";
import { can, type Permission } from "@/lib/permissions/permissions";
import { prisma } from "@/lib/prisma/client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
}

export async function requireActiveUser(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, image: true, role: true, status: true },
  });

  if (!user) redirect("/login");
  if (user.status !== "ACTIVE") redirect("/login");

  return user;
}

export async function requirePermission(permission: Permission): Promise<AuthenticatedUser> {
  const user = await requireActiveUser();
  if (!can(user.role, permission)) notFound();
  return user;
}
