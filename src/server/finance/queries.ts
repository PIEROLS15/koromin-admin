import "server-only";

import { prisma } from "@/lib/prisma/client";

export async function getExpenseList() {
  return prisma.expense.findMany({
    orderBy: { date: "desc" },
    take: 100,
    include: { order: true, sale: true },
  });
}

export async function getInvestorRows() {
  const investments = await prisma.orderInvestment.groupBy({ by: ["userId"], _sum: { amount: true }, _count: true });
  const users = await prisma.user.findMany({
    where: { id: { in: investments.map((item) => item.userId) } },
    select: { id: true, name: true, email: true },
  });
  const userById = new Map(users.map((user) => [user.id, user]));

  return investments.map((investment) => {
    const user = userById.get(investment.userId);
    return {
      userId: investment.userId,
      name: user?.name ?? user?.email ?? investment.userId,
      total: investment._sum.amount?.toNumber() ?? 0,
      count: investment._count,
    };
  });
}
