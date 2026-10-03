import { PrismaClient } from "@prisma/client";
import type { BrowserContext } from "@playwright/test";

const prisma = new PrismaClient();

export async function signInAsAdmin(context: BrowserContext) {
  await prisma.$queryRaw`SELECT 1`;

  const email = `admin-${crypto.randomUUID()}@test.local`;
  const user = await prisma.user.create({
    data: { email, name: "Admin E2E", role: "ADMIN", status: "ACTIVE" },
  });
  const sessionToken = crypto.randomUUID();

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires: new Date(Date.now() + 1000 * 60 * 60),
    },
  });

  await context.addCookies([
    {
      name: "next-auth.session-token",
      value: sessionToken,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
