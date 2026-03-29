import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  try {
    // Cash balance
    const ledger = await prisma.cashLedger.findFirst();
    const cashBalance = ledger?.balance || 0;

    // Total lent vs received (cash)
    const cashStats = await prisma.cashTransaction.groupBy({
      by: ["type"],
      _sum: { amount: true },
    });

    const totalLent =
      cashStats.find((s) => s.type === "LENT")?._sum.amount || 0;
    const totalReceived =
      cashStats.find((s) => s.type === "RECEIVED")?._sum.amount || 0;

    // Gold inventory
    const goldInventory = await prisma.goldInventory.findMany({
      orderBy: { carat: "asc" },
    });

    // Recent transactions
    const recentCashTransactions = await prisma.cashTransaction.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: { person: true },
    });

    const recentGoldTransactions = await prisma.goldTransaction.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: { person: true },
    });

    // Monthly stats for last 6 months
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = startOfMonth(subMonths(new Date(), i - 1));

      const [cashIn, cashOut, goldIn, goldOut] = await Promise.all([
        prisma.cashTransaction.aggregate({
          where: {
            type: { in: ["RECEIVED", "DEPOSIT"] },
            date: { gte: monthStart, lt: monthEnd },
          },
          _sum: { amount: true },
        }),
        prisma.cashTransaction.aggregate({
          where: {
            type: { in: ["LENT", "WITHDRAWAL"] },
            date: { gte: monthStart, lt: monthEnd },
          },
          _sum: { amount: true },
        }),
        prisma.goldTransaction.aggregate({
          where: {
            type: { in: ["RECEIVED", "DEPOSIT"] },
            date: { gte: monthStart, lt: monthEnd },
          },
          _sum: { weight: true },
        }),
        prisma.goldTransaction.aggregate({
          where: {
            type: { in: ["LENT", "WITHDRAWAL"] },
            date: { gte: monthStart, lt: monthEnd },
          },
          _sum: { weight: true },
        }),
      ]);

      monthlyStats.push({
        month: format(monthStart, "MMM yy"),
        cashIn: cashIn._sum.amount || 0,
        cashOut: cashOut._sum.amount || 0,
        goldIn: goldIn._sum.weight || 0,
        goldOut: goldOut._sum.weight || 0,
      });
    }

    // Cash flow last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCash = await prisma.cashTransaction.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: "asc" },
    });

    // Group by date for chart
    const cashFlowMap = new Map<
      string,
      { lent: number; received: number; balance: number }
    >();
    let runningBalance = cashBalance;

    // We need to reverse calculate — simplify by just showing daily flow
    for (const tx of recentCash) {
      const dateKey = format(new Date(tx.date), "dd MMM");
      if (!cashFlowMap.has(dateKey)) {
        cashFlowMap.set(dateKey, { lent: 0, received: 0, balance: 0 });
      }
      const entry = cashFlowMap.get(dateKey)!;
      if (tx.type === "LENT" || tx.type === "WITHDRAWAL") {
        entry.lent += tx.amount;
      } else {
        entry.received += tx.amount;
      }
    }

    const cashFlowData = Array.from(cashFlowMap.entries()).map(
      ([date, data]) => ({
        date,
        lent: data.lent,
        received: data.received,
        balance: runningBalance,
      })
    );

    // Person count
    const totalPersons = await prisma.person.count();
    const totalTransactions =
      (await prisma.cashTransaction.count()) +
      (await prisma.goldTransaction.count());

    return NextResponse.json({
      cashBalance,
      totalLent,
      totalReceived,
      goldInventory,
      recentCashTransactions,
      recentGoldTransactions,
      monthlyStats,
      cashFlowData,
      totalPersons,
      totalTransactions,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
