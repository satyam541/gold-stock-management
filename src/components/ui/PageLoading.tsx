"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-lg bg-muted/70",
                className
            )}
        />
    );
}

function StatCardSkeleton() {
    return (
        <div className="stat-card">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-3 w-20" />
        </div>
    );
}

function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
    return (
        <tr className="border-b border-border">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className={cn("h-4", i === 0 ? "w-28" : "w-20")} />
                </td>
            ))}
        </tr>
    );
}

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-28 rounded-lg" />
                    <Skeleton className="h-9 w-28 rounded-lg" />
                </div>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border bg-muted/30">
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="px-4 py-3 text-left">
                                <Skeleton className="h-3 w-16" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRowSkeleton key={i} cols={cols} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="mb-4 h-5 w-36" />
            <Skeleton className="h-64 w-full rounded-lg" />
        </div>
    );
}

// ─── Exported Page Loading Variants ───────────────────

export function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48 mb-1" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
            <TableSkeleton rows={4} cols={5} />
        </div>
    );
}

export function CashLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-44 mb-1" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
            <TableSkeleton rows={6} cols={6} />
        </div>
    );
}

export function GoldLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-44 mb-1" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
            <TableSkeleton rows={6} cols={7} />
        </div>
    );
}

export function PersonsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-64 rounded-lg" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TransactionsLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-44 mb-1" />
                <Skeleton className="h-4 w-56" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
            <TableSkeleton rows={8} cols={6} />
        </div>
    );
}

export function ReportsLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-4 w-56" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
        </div>
    );
}

export function SettingsLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-4 w-56" />
            </div>
            <div className="flex gap-2 border-b border-border pb-3">
                <Skeleton className="h-9 w-32 rounded-lg" />
                <Skeleton className="h-9 w-40 rounded-lg" />
                <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-36" />
                        </div>
                        <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function GenericLoading({ label }: { label?: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
                {label || "Loading..."}
            </p>
        </div>
    );
}
