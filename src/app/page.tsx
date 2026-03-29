import { Banknote, Gem, TrendingDown, TrendingUp, Users, ArrowLeftRight } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import CashFlowChart from "@/components/dashboard/CashFlowChart";
import GoldChart from "@/components/dashboard/GoldChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { formatCurrency, formatWeight } from "@/lib/utils";

async function getDashboardData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/dashboard`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  } catch {
    // Return mock data for build/development without DB
    return {
      cashBalance: 250000,
      totalLent: 150000,
      totalReceived: 400000,
      totalPersons: 12,
      totalTransactions: 48,
      goldInventory: [
        { id: "1", carat: "22k", weight: 250.5, updatedAt: new Date().toISOString() },
        { id: "2", carat: "24k", weight: 120.25, updatedAt: new Date().toISOString() },
      ],
      recentCashTransactions: [],
      recentGoldTransactions: [],
      monthlyStats: [
        { month: "Oct 24", cashIn: 80000, cashOut: 45000, goldIn: 50, goldOut: 30 },
        { month: "Nov 24", cashIn: 120000, cashOut: 60000, goldIn: 80, goldOut: 55 },
        { month: "Dec 24", cashIn: 95000, cashOut: 70000, goldIn: 45, goldOut: 40 },
        { month: "Jan 25", cashIn: 140000, cashOut: 85000, goldIn: 90, goldOut: 60 },
        { month: "Feb 25", cashIn: 110000, cashOut: 55000, goldIn: 70, goldOut: 35 },
        { month: "Mar 25", cashIn: 160000, cashOut: 90000, goldIn: 110, goldOut: 75 },
      ],
      cashFlowData: [],
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
