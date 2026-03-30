"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface ControlProps {
    search: string;
    onSearchChange: (v: string) => void;
    pageSize: number;
    onPageSizeChange: (v: number) => void;
    currentPage: number;
    onPageChange: (v: number) => void;
    totalItems: number;
    totalPages: number;
    from: number;
    to: number;
}

export function DataTableHeader({
    search,
    onSearchChange,
    pageSize,
    onPageSizeChange,
}: Pick<ControlProps, "search" | "onSearchChange" | "pageSize" | "onPageSizeChange">) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Show
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="h-8 rounded-md border border-border bg-card px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    {[10, 25, 50, 100].map((n) => (
                        <option key={n} value={n}>
                            {n}
                        </option>
                    ))}
                </select>
                entries
            </div>
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search..."
                    className="h-8 w-52 rounded-md border border-border bg-card pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
            </div>
        </div>
    );
}

export function DataTableFooter({
    currentPage,
    totalPages,
    totalItems,
    from,
    to,
    onPageChange,
}: Pick<ControlProps, "currentPage" | "totalPages" | "totalItems" | "from" | "to" | "onPageChange">) {
    const pages = getPageNumbers(currentPage, totalPages);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
                {totalItems === 0 ? "No entries" : `Showing ${from} to ${to} of ${totalItems} entries`}
            </p>
            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" /> Prev
                    </button>
                    {pages.map((p, i) =>
                        p === "..." ? (
                            <span key={`dots-${i}`} className="px-1 text-muted-foreground">
                                …
                            </span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPageChange(p as number)}
                                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${currentPage === p
                                        ? "bg-primary text-primary-foreground"
                                        : "border border-border hover:bg-muted"
                                    }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Next <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | "...")[] = [1];
    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push("...");
    pages.push(total);

    return pages;
}
