"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MonthlyStats } from "@/types";

interface GoldChartProps {
  data: MonthlyStats[];
}

const GOLD_COLORS = ["#f59e0b", "#fbbf24", "#d97706", "#b45309", "#fcd34d", "#92400e"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-mono font-semibold">{entry.value.toFixed(2)}g</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function GoldChart({ data }: GoldChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold">Gold Flow</h3>
          <p className="text-xs text-muted-foreground">Monthly gold in vs out (grams)</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-xs text-muted-foreground">In</span>
          <span className="ml-1 h-2 w-2 rounded-full bg-amber-700" />
          <span className="text-xs text-muted-foreground">Out</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}g`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
          <Bar dataKey="goldIn" name="Gold In" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="goldOut" name="Gold Out" fill="#b45309" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
