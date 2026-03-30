"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Banknote, TrendingDown, TrendingUp, Printer, Trash2, ArrowDownCircle, ArrowUpCircle, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import {
    formatCurrency, formatDate, getTransactionBadgeClass,
    getTransactionLabel, DEFAULT_TRANSACTION_TYPES,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CashTransaction, Person } from "@/types";
import PersonCombobox from "@/components/ui/PersonCombobox";
import toast from "react-hot-toast";

interface FormData {
    personId: string;
    personName: string;
    type: string;
    amount: string;
    date: string;
    notes: string;
}

const emptyForm = (): FormData => ({
    personId: "",
    personName: "",
    type: "LENT",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
});

export default function CashPage() {
    const [transactions, setTransactions] = useState<CashTransaction[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [initialBalance, setInitialBalance] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterPerson, setFilterPerson] = useState("");
    const [form, setForm] = useState<FormData>(emptyForm());
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Adjust-balance modal
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustMode, setAdjustMode] = useState<"add" | "withdraw">("add");
    const [adjustAmount, setAdjustAmount] = useState("");
    const [adjustNotes, setAdjustNotes] = useState("");
    const [adjusting, setAdjusting] = useState(false);
    const [adjustError, setAdjustError] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterType) params.set("type", filterType);
            if (filterPerson) params.set("personId", filterPerson);

            const [txRes, ledgerRes, personRes] = await Promise.all([
                fetch(`/api/cash-transactions?${params}`),
                fetch("/api/cash-ledger"),
                fetch("/api/persons"),
            ]);
            const txData = await txRes.json();
            const ledger = await ledgerRes.json();
            const pData = await personRes.json();

            setTransactions(txData.transactions || []);
            setBalance(ledger.balance || 0);
            setPersons(Array.isArray(pData) ? pData : []);
        } finally {
            setLoading(false);
        }
    }, [filterType, filterPerson]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async () => {
        setError("");
        if (!form.personId) { setError("Please select or type a person name."); toast.error("Please select or type a person name."); return; }
        if (!form.amount || parseFloat(form.amount) <= 0) { setError("Please enter a valid amount."); toast.error("Please enter a valid amount."); return; }
        setSubmitting(true);
        try {
            const res = await fetch("/api/cash-transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ personId: form.personId, type: form.type, amount: form.amount, date: form.date, notes: form.notes }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Transaction saved successfully!");
            setShowModal(false);
            setForm(emptyForm());
            fetchData();
        } catch { setError("Failed to save. Please try again."); toast.error("Failed to save transaction."); }
        finally { setSubmitting(false); }
    };

    const handleSetBalance = async () => {
        await fetch("/api/cash-ledger", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ balance: parseFloat(initialBalance) }),
        });
        toast.success("Cash balance updated!");
        setShowBalanceModal(false);
        setInitialBalance("");
        fetchData();
    };

    const handleAdjustBalance = async () => {
        setAdjustError("");
        const amount = parseFloat(adjustAmount);
        if (!adjustAmount || isNaN(amount) || amount <= 0) {
            setAdjustError("Please enter a valid amount greater than 0.");
            return;
        }
        setAdjusting(true);
        try {
            const delta = adjustMode === "add" ? amount : -amount;
            const res = await fetch("/api/cash-ledger/adjust", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ delta, notes: adjustNotes }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success(adjustMode === "add" ? "Cash added to balance!" : "Cash withdrawn from balance!");
            setShowAdjustModal(false);
            setAdjustAmount("");
            setAdjustNotes("");
            fetchData();
        } catch {
            setAdjustError("Failed to update balance. Please try again.");
            toast.error("Failed to update balance.");
        } finally {
            setAdjusting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this transaction?")) return;
        await fetch(`/api/cash-transactions/${id}`, { method: "DELETE" });
        toast.success("Transaction deleted.");
        fetchData();
    };

    const totalLent = transactions.filter((t) => t.type === "LENT" || t.type === "WITHDRAWAL").reduce((s, t) => s + t.amount, 0);
    const totalReceived = transactions.filter((t) => t.type === "RECEIVED" || t.type === "DEPOSIT").reduce((s, t) => s + t.amount, 0);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                {/* Cash Balance card — has inline add/withdraw buttons */}
                <div className="stat-card">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cash Balance</p>
                            <p className="mt-1 font-display text-2xl font-bold">{formatCurrency(balance)}</p>
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => { setAdjustMode("add"); setAdjustAmount(""); setAdjustNotes(""); setAdjustError(""); setShowAdjustModal(true); }}
                                    className="flex items-center gap-1.5 rounded-md bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors"
                                >
                                    <ArrowDownCircle className="h-3.5 w-3.5" /> Add Cash
                                </button>
                                <button
                                    onClick={() => { setAdjustMode("withdraw"); setAdjustAmount(""); setAdjustNotes(""); setAdjustError(""); setShowAdjustModal(true); }}
                                    className="flex items-center gap-1.5 rounded-md bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 transition-colors"
                                >
                                    <ArrowUpCircle className="h-3.5 w-3.5" /> Withdraw
                                </button>
                            </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 ml-3 shrink-0">
                            <Banknote className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Lent + Received */}
                {[
                    { label: "Total Lent Out", value: formatCurrency(totalLent), icon: TrendingDown, color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
                    { label: "Total Received", value: formatCurrency(totalReceived), icon: TrendingUp, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                                <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
                            </div>
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", s.color)}>
                                <s.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={() => { setForm(emptyForm()); setError(""); setShowModal(true); }}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" /> New Transaction
                </button>
                <button
                    onClick={() => { setAdjustMode("add"); setAdjustAmount(""); setAdjustNotes(""); setAdjustError(""); setShowAdjustModal(true); }}
                    className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/10 dark:text-green-400 transition-colors"
                >
                    <ArrowDownCircle className="h-4 w-4" /> Add Cash
                </button>
                <button
                    onClick={() => { setAdjustMode("withdraw"); setAdjustAmount(""); setAdjustNotes(""); setAdjustError(""); setShowAdjustModal(true); }}
                    className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/10 dark:text-orange-400 transition-colors"
                >
                    <ArrowUpCircle className="h-4 w-4" /> Withdraw Cash
                </button>
                <button
                    onClick={() => setShowBalanceModal(true)}
                    title="Override balance (set exact amount)"
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                    <SlidersHorizontal className="h-4 w-4" /> Set Balance
                </button>
                <div className="ml-auto flex gap-2">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">All Types</option>
                        {DEFAULT_TRANSACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)} className="h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">All Persons</option>
                        {persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                {["Bill No", "Person", "Type", "Amount", "Date", "Notes", "Actions"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <p className="text-sm text-muted-foreground">No cash transactions yet.</p>
                                        <button onClick={() => { setForm(emptyForm()); setShowModal(true); }} className="mt-2 text-sm text-primary hover:underline">Record your first transaction →</button>
                                    </td>
                                </tr>
                            ) : transactions.map((tx) => (
                                <tr key={tx.id} className="table-row-hover">
                                    <td className="px-4 py-3"><span className="font-mono text-xs text-muted-foreground">{tx.billNumber?.slice(-8)}</span></td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium">{tx.person?.name}</p>
                                        {tx.person?.phone && <p className="text-xs text-muted-foreground">{tx.person.phone}</p>}
                                    </td>
                                    <td className="px-4 py-3"><span className={getTransactionBadgeClass(tx.type)}>{getTransactionLabel(tx.type)}</span></td>
                                    <td className="px-4 py-3"><span className="font-mono text-sm font-semibold">{formatCurrency(tx.amount)}</span></td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(tx.date)}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[180px] truncate">{tx.notes || "—"}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/bill/${tx.id}?type=cash`} className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors" title="Print Bill">
                                                <Printer className="h-3.5 w-3.5" />
                                            </Link>
                                            <button onClick={() => handleDelete(tx.id)} className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-destructive/10 hover:text-destructive transition-colors">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── New Transaction Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h3 className="font-display text-lg font-semibold mb-1">New Cash Transaction</h3>
                        <p className="text-xs text-muted-foreground mb-5">
                            Type a name to search, or press <kbd className="rounded bg-muted px-1 text-[10px]">Enter</kbd> to create a new person instantly.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Person <span className="text-destructive">*</span>
                                </label>
                                <PersonCombobox
                                    value={form.personId}
                                    personName={form.personName}
                                    onChange={(id, name) => setForm({ ...form, personId: id, personName: name })}
                                    placeholder="Search or type a new name..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Type <span className="text-destructive">*</span></label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                        {DEFAULT_TRANSACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Amount (INR) <span className="text-destructive">*</span></label>
                                    <input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date</label>
                                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Optional notes..." className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                            </div>

                            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button onClick={() => { setShowModal(false); setError(""); }} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                            <button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                                {submitting ? "Saving..." : "Save Transaction"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Set Balance Modal (override) ── */}
            {showBalanceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h3 className="font-display text-lg font-semibold mb-1">Override Cash Balance</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            This <strong>replaces</strong> the current balance with an exact figure. Use for initial setup or corrections only.
                        </p>
                        <div className="mb-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                            Current balance: <span className="font-mono font-semibold">{formatCurrency(balance)}</span>
                        </div>
                        <input type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} placeholder="Enter new balance amount" className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <div className="mt-4 flex gap-3">
                            <button onClick={() => setShowBalanceModal(false)} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                            <button onClick={handleSetBalance} disabled={!initialBalance} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Override</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add / Withdraw Cash Modal ── */}
            {showAdjustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        {/* Mode toggle */}
                        <div className="flex gap-1 rounded-xl bg-muted/50 p-1 mb-5">
                            <button
                                onClick={() => { setAdjustMode("add"); setAdjustError(""); }}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${adjustMode === "add"
                                    ? "bg-green-500 text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <ArrowDownCircle className="h-4 w-4" /> Add Cash
                            </button>
                            <button
                                onClick={() => { setAdjustMode("withdraw"); setAdjustError(""); }}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${adjustMode === "withdraw"
                                    ? "bg-orange-500 text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <ArrowUpCircle className="h-4 w-4" /> Withdraw
                            </button>
                        </div>

                        <h3 className="font-display text-lg font-semibold mb-1">
                            {adjustMode === "add" ? "Add Cash to Balance" : "Withdraw Cash from Balance"}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-5">
                            {adjustMode === "add"
                                ? "Adds money directly to your cash balance — e.g. cash received from sales, income, etc."
                                : "Deducts money from your cash balance — e.g. expenses, purchases, etc."}
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Amount (INR) <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    autoFocus
                                    value={adjustAmount}
                                    onChange={(e) => setAdjustAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full h-10 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes (optional)</label>
                                <input
                                    type="text"
                                    value={adjustNotes}
                                    onChange={(e) => setAdjustNotes(e.target.value)}
                                    placeholder={adjustMode === "add" ? "e.g. Cash from sales" : "e.g. Rent payment"}
                                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>

                            {/* Live balance preview */}
                            {adjustAmount && parseFloat(adjustAmount) > 0 && (
                                <div className={`rounded-lg border px-4 py-3 ${adjustMode === "add"
                                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
                                    : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10"
                                    }`}>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Current balance</span>
                                        <span className="font-mono font-semibold">{formatCurrency(balance)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-1">
                                        <span className="text-muted-foreground">
                                            {adjustMode === "add" ? "Adding" : "Withdrawing"}
                                        </span>
                                        <span className={`font-mono font-semibold ${adjustMode === "add" ? "text-green-600" : "text-orange-600"}`}>
                                            {adjustMode === "add" ? "+" : "−"}{formatCurrency(parseFloat(adjustAmount) || 0)}
                                        </span>
                                    </div>
                                    <div className="mt-2 border-t border-current/10 pt-2 flex items-center justify-between">
                                        <span className="text-sm font-semibold">New balance</span>
                                        <span className="font-mono text-base font-bold">
                                            {formatCurrency(
                                                adjustMode === "add"
                                                    ? balance + (parseFloat(adjustAmount) || 0)
                                                    : balance - (parseFloat(adjustAmount) || 0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {adjustError && (
                                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{adjustError}</p>
                            )}
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={() => { setShowAdjustModal(false); setAdjustError(""); }}
                                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdjustBalance}
                                disabled={adjusting || !adjustAmount}
                                className={`flex-1 rounded-lg py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${adjustMode === "add"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-orange-500 hover:bg-orange-600"
                                    }`}
                            >
                                {adjusting ? "Saving..." : adjustMode === "add" ? "Add to Balance" : "Withdraw"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
