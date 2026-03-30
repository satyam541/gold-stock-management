"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Gem } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type GoldLedgerEntry = {
    id: string;
    type: string;
    grossWeight: number;
    purity: number;
    wastagePercent: number;
    pureGoldWeight: number;
    wastageWeight: number;
    finalWeight: number;
    goldRate: number;
    totalAmount: number;
    notes: string | null;
    date: string;
};

const TRANSACTION_TYPES = [
    { value: "GIVEN", label: "Given" },
    { value: "RECEIVED", label: "Received" },
    { value: "PURCHASE", label: "Purchase" },
    { value: "SALE", label: "Sale" },
];

const TYPE_BADGE: Record<string, string> = {
    GIVEN: "bg-red-100 text-red-700",
    RECEIVED: "bg-green-100 text-green-700",
    PURCHASE: "bg-blue-100 text-blue-700",
    SALE: "bg-amber-100 text-amber-700",
};

const emptyForm = () => ({
    type: "GIVEN",
    grossWeight: "",
    purity: "91.6",
    wastagePercent: "0",
    goldRate: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
});

export default function GoldLedger({ personId }: { personId: string }) {
    const [entries, setEntries] = useState<GoldLedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/persons/${personId}/gold-ledger`);
            const data = await res.json();
            setEntries(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    }, [personId]);

    useEffect(() => { fetchEntries(); }, [fetchEntries]);

    // ── Live calculation preview ──────────────────────────────────────────────
    const calc = (() => {
        const gw = parseFloat(form.grossWeight) || 0;
        const p = parseFloat(form.purity) || 0;
        const rate = parseFloat(form.goldRate) || 0;
        const wp = parseFloat(form.wastagePercent) || 0;

        const pureGold = gw * (p / 100);
        const wastage = pureGold * (wp / 100);
        const finalWeight = pureGold - wastage;
        const totalAmount = finalWeight * rate;

        return { pureGold, wastage, finalWeight, totalAmount };
    })();

    const handleSubmit = async () => {
        setError("");
        if (!form.grossWeight || !form.purity || !form.goldRate) {
            setError("Gross weight, purity, and gold rate are required.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`/api/persons/${personId}/gold-ledger`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Failed");
            setShowForm(false);
            setForm(emptyForm());
            fetchEntries();
        } catch {
            setError("Failed to save. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const f = (n: number, d = 3) => n.toFixed(d);

    // ── Summary totals ─────────────────────────────────────────────────────────
    const totals = entries.reduce(
        (acc, e) => {
            const sign = (e.type === "GIVEN" || e.type === "SALE") ? -1 : 1;
            const amount = e.finalWeight;
            acc.finalWeight += sign * e.finalWeight;
            acc.totalAmount += sign * e.totalAmount;
            if (sign < 0) {
                acc.issued += e.finalWeight;
            } else {
                acc.receipt += e.finalWeight;
            }
            return acc;
        },
        { finalWeight: 0, totalAmount: 0, issued: 0, receipt: 0 }
    );

    return (
        <div className="space-y-4">
            {/* Summary row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="stat-card">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Net Gold Weight</p>
                    <p className="mt-1 font-display text-xl font-bold gold-text">{f(totals.finalWeight)}g</p>
                </div>
                <div className="stat-card">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Net Amount</p>
                    <p className="mt-1 font-display text-xl font-bold">{formatCurrency(totals.totalAmount)}</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                    {entries.length} {entries.length === 1 ? "Entry" : "Entries"}
                </h4>
                <button
                    onClick={() => { setForm(emptyForm()); setError(""); setShowForm(true); }}
                    className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Add Entry
                </button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                {["Date", "Particulars", "Type", "Issued", "Receipt", "Dr/Cr", "Balance", "Notes"].map((h) => (
                                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                            ) : entries.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-10 text-center">
                                        <Gem className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                                        <p className="text-sm text-muted-foreground">No gold ledger entries yet.</p>
                                    </td>
                                </tr>
                            ) : (() => {
                                let runningBalance = 0;
                                return (
                                    <>
                                        {entries.map((e) => {
                                            const sign = (e.type === "GIVEN" || e.type === "SALE") ? -1 : 1;
                                            const issued = sign < 0 ? e.finalWeight : 0;
                                            const receipt = sign > 0 ? e.finalWeight : 0;
                                            const drcr = sign > 0 ? "DR" : "CR";
                                            runningBalance += sign * e.finalWeight;
                                            const particulars = `${f(e.grossWeight, 3)} x ${e.purity.toFixed(2)}`;

                                            return (
                                                <tr key={e.id} className="table-row-hover">
                                                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatDate(e.date)}</td>
                                                    <td className="px-3 py-2.5 font-mono">{particulars}</td>
                                                    <td className="px-3 py-2.5">
                                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_BADGE[e.type] ?? "bg-muted text-muted-foreground"}`}>
                                                            {TRANSACTION_TYPES.find((t) => t.value === e.type)?.label ?? e.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 font-mono text-right text-amber-700">{issued ? `${f(issued)}g` : "-"}</td>
                                                    <td className="px-3 py-2.5 font-mono text-right text-green-700">{receipt ? `${f(receipt)}g` : "-"}</td>
                                                    <td className="px-3 py-2.5 font-mono font-semibold">{drcr}</td>
                                                    <td className="px-3 py-2.5 font-mono font-semibold">{f(runningBalance)}g</td>
                                                    <td className="px-3 py-2.5 text-muted-foreground max-w-[140px] truncate">{e.notes || "—"}</td>
                                                </tr>
                                            );
                                        })}

                                        <tr className="border-t border-border bg-muted/20 font-semibold">
                                            <td colSpan={3} className="px-3 py-2.5">Totals</td>
                                            <td className="px-3 py-2.5 text-right">{f(totals.issued)}g</td>
                                            <td className="px-3 py-2.5 text-right">{f(totals.receipt)}g</td>
                                            <td className="px-3 py-2.5" />
                                            <td className="px-3 py-2.5 text-right">{f(totals.finalWeight)}g</td>
                                            <td className="px-3 py-2.5" />
                                        </tr>
                                    </>
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Add Entry Modal ── */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h3 className="font-display text-lg font-semibold mb-5">New Gold Ledger Entry</h3>

                        <div className="space-y-4">
                            {/* Row 1: Type + Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Type *</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    >
                                        {TRANSACTION_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Gross Weight + Purity + Wastage */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Gross Weight (g) *</label>
                                    <input
                                        type="number" step="0.001" min="0"
                                        value={form.grossWeight}
                                        onChange={(e) => setForm({ ...form, grossWeight: e.target.value })}
                                        placeholder="0.000"
                                        className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Purity (%) *</label>
                                    <input
                                        type="number" step="0.1" min="0" max="100"
                                        value={form.purity}
                                        onChange={(e) => setForm({ ...form, purity: e.target.value })}
                                        placeholder="91.6"
                                        className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Impurity / Loss</label>
                                    <p className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 flex items-center">{f(calc.wastage)}g</p>
                                </div>
                            </div>

                            {/* Row 3: Gold Rate */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Gold Rate (per gram, PKR) *</label>
                                <input
                                    type="number" min="0"
                                    value={form.goldRate}
                                    onChange={(e) => setForm({ ...form, goldRate: e.target.value })}
                                    placeholder="e.g. 8500"
                                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>

                            {/* ── Live Calculation Preview ── */}
                            {parseFloat(form.grossWeight) > 0 && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-3">
                                        Live Preview
                                    </p>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Gold</span>
                                            <span className="font-mono font-semibold">{f(parseFloat(form.grossWeight))}g</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Wastage</span>
                                            <span className="font-mono font-semibold">{f(calc.wastage)}g</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Final Weight</span>
                                            <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{f(calc.finalWeight)}g</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Amount</span>
                                            <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{formatCurrency(calc.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes</label>
                                <input
                                    type="text"
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Optional notes..."
                                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>

                            {error && (
                                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>
                            )}
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={() => { setShowForm(false); setError(""); }}
                                className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {submitting ? "Saving..." : "Save Entry"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}