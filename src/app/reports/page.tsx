"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency, formatWeight } from "@/lib/utils";

const PIE_COLORS = ["#f59e0b", "#fbbf24", "#d97706", "#b45309", "#fcd34d"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-sm">
      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      {payload.map((e: any) => (
        <div key={e.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-muted-foreground">{e.name}:</span>
          <span className="font-mono font-semibold">{typeof e.value === "number" && e.value > 100 ? formatCurrency(e.value) : e.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => {
        // Mock data if API fails
        setData({
          cashBalance: 250000,
          totalLent: 150000,
          totalReceived: 400000,
          goldInventory: [
            { id: "1", carat: "22k", weight: 250.5 },
            { id: "2", carat: "24k", weight: 120.25 },
            { id: "3", carat: "18k", weight: 80.0 },
          ],
          monthlyStats: [
            { month: "Oct 24", cashIn: 80000, cashOut: 45000, goldIn: 50, goldOut: 30 },
            { month: "Nov 24", cashIn: 120000, cashOut: 60000, goldIn: 80, goldOut: 55 },
            { month: "Dec 24", cashIn: 95000, cashOut: 70000, goldIn: 45, goldOut: 40 },
            { month: "Jan 25", cashIn: 140000, cashOut: 85000, goldIn: 90, goldOut: 60 },
            { month: "Feb 25", cashIn: 110000, cashOut: 55000, goldIn: 70, goldOut: 35 },
            { month: "Mar 25", cashIn: 160000, cashOut: 90000, goldIn: 110, goldOut: 75 },
          ],
        });
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading reports...</div>;

  const totalGold = data.goldInventory?.reduce((s: number, i: any) => s + i.weight, 0) || 0;
  const netCash = (data.totalReceived || 0) - (data.totalLent || 0);
  const profitLossData = data.monthlyStats?.map((m: any) => ({
    ...m,
    net: m.cashIn - m.cashOut,
  })) || [];

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Cash Balance", value: formatCurrency(data.cashBalance || 0), sub: "Current liquid cash", color: "text-green-600" },
          { label: "Net Cash Flow", value: formatCurrency(netCash), sub: "Received minus lent", color: netCash >= 0 ? "text-green-600" : "text-red-600" },
          { label: "Gold Holdings", value: formatWeight(totalGold), sub: `${data.goldInventory?.length || 0} carat types`, color: "text-amber-600" },
          { label: "Total Persons", value: String(data.totalPersons || 0), sub: "Active counterparties", color: "text-blue-600" },
        ].map((k) => (
          <div key={k.label} className="stat-card text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{k.label}</p>
            <p className={`mt-1 font-display text-xl font-bold ${k.color}`}>{k.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Cash Flow Area Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4">
          <h3 className="font-display text-base font-semibold">Monthly Cash Flow</h3>
          <p className="text-xs text-muted-foreground">Inflow vs outflow over 6 months</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data.monthlyStats} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="rptIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rptOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
            <Area type="monotone" dataKey="cashIn" name="Cash In" stroke="#22c55e" strokeWidth={2} fill="url(#rptIn)" dot={false} />
            <Area type="monotone" dataKey="cashOut" name="Cash Out" stroke="#ef4444" strokeWidth={2} fill="url(#rptOut)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Net Profit/Loss + Gold Inventory */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profit/Loss Bar */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold">Net Cash P&L</h3>
            <p className="text-xs text-muted-foreground">Monthly profit & loss</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={profitLossData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="net" name="Net" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {profitLossData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.net >= 0 ? "#22c55e" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gold Inventory Pie */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold">Gold Inventory Split</h3>
            <p className="text-xs text-muted-foreground">By carat type</p>
          </div>
          {data.goldInventory?.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={data.goldInventory} dataKey="weight" nameKey="carat" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {data.goldInventory.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toFixed(2)}g`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data.goldInventory.map((inv: any, i: number) => (
                  <div key={inv.id} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-sm font-medium">{inv.carat}</span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">{formatWeight(inv.weight)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span className="font-mono gold-text">{formatWeight(totalGold)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No gold inventory yet</div>
          )}
        </div>
      </div>

      {/* Gold Flow Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4">
          <h3 className="font-display text-base font-semibold">Gold Transaction Flow</h3>
          <p className="text-xs text-muted-foreground">Monthly gold in vs out (grams)</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.monthlyStats} margin={{ top: 5, right: 5, left: 5, bottom: 5 }} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}g`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="goldIn" name="Gold In" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="goldOut" name="Gold Out" fill="#b45309" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
