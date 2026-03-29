"use client";

import { useState, useEffect, useCallback } from "react";
import { Printer, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import {
    formatCurrency, formatDate, formatWeight,
    getTransactionBadgeClass, getTransactionLabel,
} from "@/lib/utils";
import { CashTransaction, GoldTransaction, Person } from "@/types";
import { useDynamicOptions } from "@/hooks/useDynamicOptions";

type TabType = "cash" | "gold";

export default function TransactionsPage() {
    const { caratOptions, transactionTypes } = useDynamicOptions();
    const [tab, setTab] = useState<TabType>("cash");
    const [cashTx, setCashTx] = useState<CashTransaction[]>([]);
    const [goldTx, setGoldTx] = useState<GoldTransaction[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterPerson, setFilterPerson] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterCarat, setFilterCarat] = useState("");
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");
    const [cashTotal, setCashTotal] = useState(0);
    const [goldTotal, setGoldTotal] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const cashParams = new URLSearchParams();
            const goldParams = new URLSearchParams();
            if (filterPerson) { cashParams.set("personId", filterPerson); goldParams.set("personId", filterPerson); }
            if (filterType) { cashParams.set("type", filterType); goldParams.set("type", filterType); }
            if (filterCarat) goldParams.set("carat", filterCarat);
            if (filterFrom) { cashParams.set("from", filterFrom); goldParams.set("from", filterFrom); }
            if (filterTo) { cashParams.set("to", filterTo); goldParams.set("to", filterTo); }

            const [cashRes, goldRes, personRes] = await Promise.all([
                fetch(`/api/cash-transactions?${cashParams}&limit=50`),
                fetch(`/api/gold-transactions?${goldParams}&limit=50`),
                fetch("/api/persons"),
            ]);
            const cData = await cashRes.json();
            const gData = await goldRes.json();
            setCashTx(cData.transactions || []);
            setGoldTx(gData.transactions || []);
            setCashTotal(cData.total || 0);
            setGoldTotal(gData.total || 0);
            const pData = await personRes.json();
            setPersons(pData.persons || []);
        } finally {
            setLoading(false);
        }
    }, [filterPerson, filterType, filterCarat, filterFrom, filterTo]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const clearFilters = () => {
        setFilterPerson(""); setFilterType(""); setFilterCarat(""); setFilterFrom(""); setFilterTo("");
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
                {(["cash", "gold"] as TabType[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-lg px-5 py-1.5 text-sm font-medium transition-all ${tab === t
                            ? "bg-card shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {t === "cash" ? "💵" : "🥇"} {t.charAt(0).toUpperCase() + t.slice(1)}
                        <span className="ml-1.5 text-xs opacity-60">
                            ({t === "cash" ? cashTotal : goldTotal})
                        </span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Person</label>
                        <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} className="h-8 rounded-lg border border-border bg-muted/30 px-2 text-sm focus:outline-none">
                            <option value="">All Persons</option>
                            {persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-8 rounded-lg border border-border bg-muted/30 px-2 text-sm focus:outline-none">
                            <option value="">All Types</option>
                            {transactionTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    {tab === "gold" && (
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Carat</label>
                            <select value={filterCarat} onChange={(e) => setFilterCarat(e.target.value)} className="h-8 rounded-lg border border-border bg-muted/30 px-2 text-sm focus:outline-none">
                                <option value="">All Carats</option>
                                {caratOptions.map((c) => <option key={c.value} value={c.value}>{c.value}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">From Date</label>
                        <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="h-8 rounded-lg border border-border bg-muted/30 px-2 text-sm focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">To Date</label>
                        <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="h-8 rounded-lg border border-border bg-muted/30 px-2 text-sm focus:outline-none" />
                    </div>
                    <button onClick={clearFilters} className="h-8 rounded-lg border border-border bg-muted/30 px-3 text-sm hover:bg-muted transition-colors">
                        Clear
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                {tab === "cash"
                                    ? ["Bill No", "Person", "Type", "Amount", "Date", "Notes", ""].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                                    ))
                                    : ["Bill No", "Person", "Carat", "Weight", "Rate/g", "Total Value", "Type", "Date", "Notes", ""].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
                            ) : tab === "cash" ? (
                                cashTx.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">No cash transactions found</td></tr>
                                ) : cashTx.map((tx) => (
                                    <tr key={tx.id} className="table-row-hover">
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.billNumber?.slice(-8)}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium">{tx.person?.name}</p>
                                            <p className="text-xs text-muted-foreground">{tx.person?.phone}</p>
                                        </td>
                                        <td className="px-4 py-3"><span className={getTransactionBadgeClass(tx.type)}>{getTransactionLabel(tx.type)}</span></td>
                                        <td className="px-4 py-3 font-mono text-sm font-semibold">{formatCurrency(tx.amount)}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(tx.date)}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-[180px] truncate">{tx.notes || "—"}</td>
                                        <td className="px-4 py-3">
                                            <Link href={`/bill/${tx.id}?type=cash`} className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors">
                                                <Printer className="h-3.5 w-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                goldTx.length === 0 ? (
                                    <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">No gold transactions found</td></tr>
                                ) : goldTx.map((tx) => (
                                    <tr key={tx.id} className="table-row-hover">
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.billNumber?.slice(-8)}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium">{tx.person?.name}</p>
                                            <p className="text-xs text-muted-foreground">{tx.person?.phone}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{tx.carat}</span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm font-semibold">{formatWeight(tx.weight)}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{tx.ratePerGram ? formatCurrency(tx.ratePerGram) : "—"}</td>
                                        <td className="px-4 py-3 font-mono text-sm">{tx.totalValue ? formatCurrency(tx.totalValue) : "—"}</td>
                                        <td className="px-4 py-3"><span className={getTransactionBadgeClass(tx.type)}>{getTransactionLabel(tx.type)}</span></td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDate(tx.date)}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-[140px] truncate">{tx.notes || "—"}</td>
                                        <td className="px-4 py-3">
                                            <Link href={`/bill/${tx.id}?type=gold`} className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors">
                                                <Printer className="h-3.5 w-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
