import { Banknote, Gem, TrendingDown, TrendingUp, Users, ArrowLeftRight } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import CashFlowChart from "@/components/dashboard/CashFlowChart";
import GoldChart from "@/components/dashboard/GoldChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { formatCurrency, formatWeight } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths, format } from "date-fns";

async function getDashboardData() {
    try {
        // Cash balance
        const ledger = await prisma.cashLedger.findFirst();
        const cashBalance = ledger?.balance || 0;

        // Total lent vs received (cash)
        const cashStats = await prisma.cashTransaction.groupBy({
            by: ["type"],
            _sum: { amount: true },
        });
        const totalLent = cashStats.find((s) => s.type === "LENT")?._sum.amount || 0;
        const totalReceived = cashStats.find((s) => s.type === "RECEIVED")?._sum.amount || 0;

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
                    where: { type: { in: ["RECEIVED", "DEPOSIT"] }, date: { gte: monthStart, lt: monthEnd } },
                    _sum: { amount: true },
                }),
                prisma.cashTransaction.aggregate({
                    where: { type: { in: ["LENT", "WITHDRAWAL"] }, date: { gte: monthStart, lt: monthEnd } },
                    _sum: { amount: true },
                }),
                prisma.goldTransaction.aggregate({
                    where: { type: { in: ["RECEIVED", "DEPOSIT"] }, date: { gte: monthStart, lt: monthEnd } },
                    _sum: { weight: true },
                }),
                prisma.goldTransaction.aggregate({
                    where: { type: { in: ["LENT", "WITHDRAWAL"] }, date: { gte: monthStart, lt: monthEnd } },
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
        const cashFlowMap = new Map<string, { lent: number; received: number }>();
        for (const tx of recentCash) {
            const dateKey = format(new Date(tx.date), "dd MMM");
            if (!cashFlowMap.has(dateKey)) {
                cashFlowMap.set(dateKey, { lent: 0, received: 0 });
            }
            const entry = cashFlowMap.get(dateKey)!;
            if (tx.type === "LENT" || tx.type === "WITHDRAWAL") {
                entry.lent += tx.amount;
            } else {
                entry.received += tx.amount;
            }
        }
        const cashFlowData = Array.from(cashFlowMap.entries()).map(([date, d]) => ({
            date,
            lent: d.lent,
            received: d.received,
            balance: cashBalance,
        }));

        // Counts
        const totalPersons = await prisma.person.count();
        const totalTransactions =
            (await prisma.cashTransaction.count()) + (await prisma.goldTransaction.count());

        return {
            cashBalance,
            totalLent,
            totalReceived,
            goldInventory: JSON.parse(JSON.stringify(goldInventory)),
            recentCashTransactions: JSON.parse(JSON.stringify(recentCashTransactions)),
            recentGoldTransactions: JSON.parse(JSON.stringify(recentGoldTransactions)),
            monthlyStats,
            cashFlowData,
            totalPersons,
            totalTransactions,
        };
    } catch (error) {
        console.error("Dashboard data error:", error);
        return {
            cashBalance: 0, totalLent: 0, totalReceived: 0, totalPersons: 0,
            totalTransactions: 0, goldInventory: [], recentCashTransactions: [],
            recentGoldTransactions: [], monthlyStats: [], cashFlowData: [],
        };
    }
}

export default async function DashboardPage() {
    const data = await getDashboardData();
    const totalGoldWeight = data.goldInventory.reduce(
        (sum: number, inv: { weight: number }) => sum + inv.weight,
        0
    );

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Cash Balance"
                    value={formatCurrency(data.cashBalance)}
                    subtitle="Current available cash"
                    icon={Banknote}
                    variant="green"
                    delay={0}
                />
                <StatCard
                    title="Total Lent"
                    value={formatCurrency(data.totalLent)}
                    subtitle="Money lent out"
                    icon={TrendingDown}
                    variant="red"
                    delay={100}
                />
                <StatCard
                    title="Gold Inventory"
                    value={formatWeight(totalGoldWeight)}
                    subtitle={`${data.goldInventory.length} carat types`}
                    icon={Gem}
                    variant="gold"
                    delay={200}
                />
                <StatCard
                    title="Total Persons"
                    value={data.totalPersons.toString()}
                    subtitle={`${data.totalTransactions} total transactions`}
                    icon={Users}
                    variant="blue"
                    delay={300}
                />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                <CashFlowChart data={data.monthlyStats} />
                <GoldChart data={data.monthlyStats} />
            </div>

            {/* Gold Inventory Breakdown + Recent Transactions */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Gold Breakdown */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-4 font-display text-base font-semibold">
                        Gold Inventory
                    </h3>
                    {data.goldInventory.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No gold inventory yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {data.goldInventory.map((inv: { id: string; carat: string; weight: number }) => {
                                const pct =
                                    totalGoldWeight > 0
                                        ? (inv.weight / totalGoldWeight) * 100
                                        : 0;
                                return (
                                    <div key={inv.id}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <span className="font-medium">{inv.carat}</span>
                                            <span className="font-mono text-muted-foreground">
                                                {formatWeight(inv.weight)}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full gold-gradient transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <p className="mt-0.5 text-right text-xs text-muted-foreground">
                                            {pct.toFixed(1)}%
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2">
                    <RecentTransactions
                        cashTransactions={data.recentCashTransactions}
                        goldTransactions={data.recentGoldTransactions}
                    />
                </div>
            </div>
        </div>
    );
}
