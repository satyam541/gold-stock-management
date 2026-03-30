"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Gem, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import {
    formatWeight, formatDate, formatCurrency,
    getTransactionBadgeClass, getTransactionLabel,
} from "@/lib/utils";
import { GoldTransaction, GoldInventory, Person } from "@/types";
import PersonCombobox from "@/components/ui/PersonCombobox";
import { useDynamicOptions } from "@/hooks/useDynamicOptions";
import toast from "react-hot-toast";

interface FormData {
    personId: string;
    personName: string;
    type: string;
    carat: string;
    weight: string;
    ratePerGram: string;
    date: string;
    notes: string;
}

const emptyForm = (): FormData => ({
    personId: "",
    personName: "",
    type: "LENT",
    carat: "22k",
    weight: "",
    ratePerGram: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
});

export default function GoldPage() {
    const { caratOptions, transactionTypes } = useDynamicOptions();
    const [transactions, setTransactions] = useState<GoldTransaction[]>([]);
    const [inventory, setInventory] = useState<GoldInventory[]>([]);
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filterCarat, setFilterCarat] = useState("");
    const [filterPerson, setFilterPerson] = useState("");
    const [form, setForm] = useState<FormData>(emptyForm());
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterCarat) params.set("carat", filterCarat);
            if (filterPerson) params.set("personId", filterPerson);

            const [txRes, invRes, personRes] = await Promise.all([
                fetch(`/api/gold-transactions?${params}`),
                fetch("/api/gold-inventory"),
                fetch("/api/persons"),
            ]);
            const txData = await txRes.json();
            const invData = await invRes.json();
            const pData = await personRes.json();

            setTransactions(txData.transactions || []);
            setInventory(invData.inventory || []);
            setPersons(Array.isArray(pData) ? pData : []);
        } finally {
            setLoading(false);
        }
    }, [filterCarat, filterPerson]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async () => {
        setError("");
        if (!form.personId) { setError("Please select or type a person name."); toast.error("Please select or type a person name."); return; }
        if (!form.weight || parseFloat(form.weight) <= 0) { setError("Please enter a valid weight."); toast.error("Please enter a valid weight."); return; }
        setSubmitting(true);
        try {
            const res = await fetch("/api/gold-transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personId: form.personId,
                    type: form.type,
                    carat: form.carat,
                    weight: form.weight,
                    ratePerGram: form.ratePerGram || null,
                    date: form.date,
                    notes: form.notes,
                }),
            });
            if (!res.ok) throw new Error("Failed");
            setShowModal(false);
            setForm(emptyForm());
            toast.success("Gold transaction created successfully!");
            fetchData();
        } catch { setError("Failed to save. Please try again."); toast.error("Failed to save transaction."); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this transaction?")) return;
        await fetch(`/api/gold-transactions/${id}`, { method: "DELETE" });
        toast.success("Gold transaction deleted successfully!");
        fetchData();
    };

    const totalWeight = inventory.reduce((s, i) => s + i.weight, 0);
    const estimatedValue =
        form.ratePerGram && form.weight
            ? parseFloat(form.ratePerGram) * parseFloat(form.weight)
            : null;

    return (
        <div className="space-y-6">
            {/* Inventory Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Total Inventory</p>
                            <p className="mt-1 font-display text-2xl font-bold gold-text">{formatWeight(totalWeight)}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient">
                            <Gem className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </div>
                {inventory.slice(0, 3).map((inv) => (
                    <div key={inv.id} className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{inv.carat} Gold</p>
                                <p className="mt-1 font-display text-2xl font-bold">{formatWeight(inv.weight)}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/20">
                                <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400">{inv.carat}</span>
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
                    <Plus className="h-4 w-4" /> New Gold Transaction
                </button>
                <div className="ml-auto flex gap-2">
                    <select value={filterCarat} onChange={(e) => setFilterCarat(e.target.value)} className="h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">All Carats</option>
                        {caratOptions.map((c) => <option key={c.value} value={c.value}>{c.value}</option>)}
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
                                {["Bill No", "Person", "Carat", "Weight", "Rate/g", "Total Value", "Type", "Date", "Notes", ""].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-12 text-center">
                                        <p className="text-sm text-muted-foreground">No gold transactions yet.</p>
                                        <button onClick={() => { setForm(emptyForm()); setShowModal(true); }} className="mt-2 text-sm text-primary hover:underline">Record your first gold transaction →</button>
                                    </td>
                                </tr>
                            ) : transactions.map((tx) => (
                                <tr key={tx.id} className="table-row-hover">
                                    <td className="px-4 py-3"><span className="font-mono text-xs text-muted-foreground">{tx.billNumber?.slice(-8)}</span></td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium">{tx.person?.name}</p>
                                        {tx.person?.phone && <p className="text-xs text-muted-foreground">{tx.person.phone}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">{tx.carat}</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-sm font-semibold">{formatWeight(tx.weight)}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{tx.ratePerGram ? formatCurrency(tx.ratePerGram) : "—"}</td>
                                    <td className="px-4 py-3 font-mono text-sm">{tx.totalValue ? formatCurrency(tx.totalValue) : "—"}</td>
                                    <td className="px-4 py-3"><span className={getTransactionBadgeClass(tx.type)}>{getTransactionLabel(tx.type)}</span></td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDate(tx.date)}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[140px] truncate">{tx.notes || "—"}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/bill/${tx.id}?type=gold`} className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors" title="Print Bill">
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

            {/* ── New Gold Transaction Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h3 className="font-display text-lg font-semibold mb-1">New Gold Transaction</h3>
                        <p className="text-xs text-muted-foreground mb-5">
                            Type a name to search, or press <kbd className="rounded bg-muted px-1 text-[10px]">Enter</kbd> to create a new person instantly.
                        </p>

                        <div className="space-y-4">
                            {/* Person — inline create */}
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

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Type <span className="text-destructive">*</span></label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                        {transactionTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Carat <span className="text-destructive">*</span></label>
                                    <select value={form.carat} onChange={(e) => setForm({ ...form, carat: e.target.value })} className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                        {caratOptions.map((c) => <option key={c.value} value={c.value}>{c.value}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Weight (g) <span className="text-destructive">*</span></label>
                                    <input type="number" step="0.001" min="0" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="0.000" className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rate per gram (INR) <span className="text-muted-foreground font-normal">(optional)</span></label>
                                <input type="number" min="0" value={form.ratePerGram} onChange={(e) => setForm({ ...form, ratePerGram: e.target.value })} placeholder="e.g. 8500" className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>

                            {/* Live value preview */}
                            {estimatedValue !== null && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 px-3 py-2">
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        Estimated value: <span className="font-mono font-bold">{formatCurrency(estimatedValue)}</span>
                                    </p>
                                </div>
                            )}

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
        </div>
    );
}
