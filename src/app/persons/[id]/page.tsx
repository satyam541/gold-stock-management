"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin, Banknote, Gem, Printer, Trash2, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { Person, CashTransaction, GoldTransaction } from "@/types";
import { formatCurrency, formatDate, formatWeight, getTransactionLabel } from "@/lib/utils";
import toast from "react-hot-toast";
import { useDataTable } from "@/hooks/useDataTable";
import { DataTableHeader, DataTableFooter } from "@/components/ui/DataTableControls";

interface PersonDetail extends Person {
    cashTransactions: CashTransaction[];
    goldTransactions: GoldTransaction[];
}

interface GoldLedgerEntry {
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
    notes?: string | null;
    date: string;
}

const DEFAULT_WASTAGE_PERCENT = 0.5; // autopopulated, can be adjusted centrally

export default function PersonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [person, setPerson] = useState<PersonDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [goldLedgerEntries, setGoldLedgerEntries] = useState<GoldLedgerEntry[]>([]);

    const [showAddLedger, setShowAddLedger] = useState(false);
    const [ledgerError, setLedgerError] = useState("");
    const [ledgerSubmitting, setLedgerSubmitting] = useState(false);
    const [editingLedgerId, setEditingLedgerId] = useState<string | null>(null);

    const getDefaultWastagePercent = () => {
        const wpFromLedger = goldLedgerEntries?.[0]?.wastagePercent;
        if (wpFromLedger && wpFromLedger > 0) return wpFromLedger;
        return DEFAULT_WASTAGE_PERCENT;
    };

    const getDefaultGoldRate = () => {
        const rateFromTransaction = person?.goldTransactions?.find((tx) => tx.ratePerGram && tx.ratePerGram > 0)?.ratePerGram;
        if (rateFromTransaction) return rateFromTransaction;
        const rateFromLedger = goldLedgerEntries?.[0]?.goldRate;
        if (rateFromLedger) return rateFromLedger;
        return 0;
    };

    const [ledgerForm, setLedgerForm] = useState({
        type: "RECEIVED",
        date: new Date().toISOString().split("T")[0],
        grossWeight: "0",
        purity: "91.6",
        notes: "",
        wastageWeight: "0", // ✅ FIXED
        goldRate: "0",
    });

    useEffect(() => {
        fetch(`/api/persons/${params.id}`)
            .then((r) => r.json())
            .then((d) => { setPerson(d); setLoading(false); })
            .catch(() => setLoading(false));

        fetch(`/api/persons/${params.id}/gold-ledger`)
            .then((r) => r.json())
            .then((d) => setGoldLedgerEntries(Array.isArray(d) ? d : []))
            .catch(() => setGoldLedgerEntries([]));
    }, [params.id]);

    type UnifiedRow = {
        id: string;
        source: "Cash" | "Gold" | "GoldLedger";
        date: string;
        particulars: string;
        type: string;
        cashIssued: number;
        cashReceipt: number;
        goldIssued: number;
        goldReceipt: number;
        drcr: string;
        notes?: string | null;
        invoiceUrl?: string;
    };

    const combinedEntries: UnifiedRow[] = useMemo(() => {
        if (!person) return [];
        return [
            ...person.cashTransactions.map((tx) => ({
                id: tx.id,
                source: "Cash" as const,
                date: tx.date,
                particulars: `Cash ${getTransactionLabel(tx.type)}`,
                type: tx.type,
                cashIssued: tx.type === "RECEIVED" || tx.type === "DEPOSIT" ? 0 : tx.amount,
                cashReceipt: tx.type === "RECEIVED" || tx.type === "DEPOSIT" ? tx.amount : 0,
                goldIssued: 0,
                goldReceipt: 0,
                drcr: tx.type === "RECEIVED" || tx.type === "DEPOSIT" ? "DR" : "CR",
                notes: tx.notes,
                invoiceUrl: tx.billNumber ? `/bill/${tx.id}?type=cash` : undefined,
            })),
            ...person.goldTransactions.map((tx) => ({
                id: tx.id,
                source: "Gold" as const,
                date: tx.date,
                particulars: `${tx.carat} / ${formatWeight(tx.weight)}${tx.ratePerGram ? ` @ ${formatCurrency(tx.ratePerGram)}` : ""}`,
                type: tx.type,
                cashIssued: 0,
                cashReceipt: 0,
                goldIssued: tx.type === "RECEIVED" || tx.type === "DEPOSIT" ? 0 : tx.weight,
                goldReceipt: tx.type === "RECEIVED" || tx.type === "DEPOSIT" ? tx.weight : 0,
                drcr: tx.type === "RECEIVED" || tx.type === "DEPOSIT" ? "DR" : "CR",
                notes: tx.notes,
                invoiceUrl: tx.billNumber ? `/bill/${tx.id}?type=gold` : undefined,
            })),
            ...goldLedgerEntries.map((e) => ({
                id: e.id,
                source: "GoldLedger" as const,
                date: e.date,
                particulars: `${formatWeight(e.finalWeight)} (gross ${formatWeight(e.grossWeight)}, purity ${e.purity}%)`,
                type: e.type,
                cashIssued: 0,
                cashReceipt: 0,
                goldIssued: e.type === "GIVEN" || e.type === "SALE" ? e.finalWeight : 0,
                goldReceipt: e.type === "GIVEN" || e.type === "SALE" ? 0 : e.finalWeight,
                drcr: e.type === "GIVEN" || e.type === "SALE" ? "CR" : "DR",
                notes: e.notes,
                invoiceUrl: undefined,
            })),
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [person, goldLedgerEntries]);

    // Pre-compute running balances in chronological order, then reverse for newest-first display
    const entriesWithBalances = useMemo(() => {
        let runningCash = 0;
        let runningGold = 0;
        const withBal = combinedEntries.map((row) => {
            runningCash += row.cashReceipt - row.cashIssued;
            runningGold += row.goldReceipt - row.goldIssued;
            return { ...row, runningCash, runningGold };
        });
        return withBal.reverse();
    }, [combinedEntries]);

    const dt = useDataTable(entriesWithBalances, {
        searchFn: (row, q) => {
            const s = [row.particulars, row.source, row.type, row.drcr, row.notes].filter(Boolean).join(" ").toLowerCase();
            return s.includes(q);
        },
    });

    if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
    if (!person) return <div className="text-muted-foreground p-4">Person not found.</div>;

    const totals = combinedEntries.reduce(
        (acc, row) => {
            acc.cashIssued += row.cashIssued;
            acc.cashReceipt += row.cashReceipt;
            acc.goldIssued += row.goldIssued;
            acc.goldReceipt += row.goldReceipt;
            return acc;
        },
        { cashIssued: 0, cashReceipt: 0, goldIssued: 0, goldReceipt: 0 }
    );

    const totalCash = totals.cashReceipt - totals.cashIssued;
    const totalGold = totals.goldReceipt - totals.goldIssued;

    const ledgerCalc = (() => {
        const gross = Number(ledgerForm.grossWeight) || 0;
        const purity = Number(ledgerForm.purity) || 0;
        const rate = Number(ledgerForm.goldRate) || getDefaultGoldRate();

        const pure = gross * (purity / 100);

        // ✅ Wastage derived automatically
        const wastage = gross - pure;

        const finalWeight = pure; // ⚠️ Important: usually final = pure (not adding wastage)

        return {
            pure,
            wastage,
            finalWeight,
            totalAmount: finalWeight * rate,
            rate,
        };
    })();

    const createLedgerEntry = async () => {
        setLedgerError("");
        const rate = Number(ledgerForm.goldRate) || getDefaultGoldRate();
        if (!ledgerForm.grossWeight || Number(ledgerForm.grossWeight) <= 0) {
            setLedgerError("Gross weight is required.");
            toast.error("Gross weight is required.");
            return;
        }
        if (!ledgerForm.purity || Number(ledgerForm.purity) <= 0) {
            setLedgerError("Purity is required.");
            toast.error("Purity is required.");
            return;
        }
        if (!rate) {
            setLedgerError("Gold rate is required.");
            toast.error("Gold rate is required.");
            return;
        }

        setLedgerSubmitting(true);
        try {
            const res = await fetch(`/api/persons/${params.id}/gold-ledger`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: ledgerForm.type,
                    grossWeight: Number(ledgerForm.grossWeight),
                    purity: Number(ledgerForm.purity),
                    wastagePercent: 0,
                    goldRate: rate,
                    date: ledgerForm.date,
                    notes: ledgerForm.notes || null,
                }),
            });

            if (!res.ok) throw new Error("Failed to save entry");
            const newEntry = await res.json();

            if (editingLedgerId) {
                // Delete old entry after creating updated one
                await fetch(`/api/persons/${params.id}/gold-ledger?entryId=${editingLedgerId}`, { method: "DELETE" });
                setGoldLedgerEntries((prev) => prev.filter((e) => e.id !== editingLedgerId).concat(newEntry));
                toast.success("Gold ledger entry updated!");
            } else {
                setGoldLedgerEntries((prev) => [...prev, newEntry]);
                toast.success("Gold ledger entry added!");
            }

            setShowAddLedger(false);
            setEditingLedgerId(null);
            setLedgerForm({
                type: "RECEIVED",
                date: new Date().toISOString().split("T")[0],
                grossWeight: "0",
                purity: "91.6",
                wastageWeight: "0",
                goldRate: "0",
                notes: "",
            });
        } catch (err) {
            setLedgerError("Unable to save entry. Please try again.");
            toast.error("Unable to save entry.");
        } finally {
            setLedgerSubmitting(false);
        }
    };

    const deleteLedgerEntry = async (entryId: string) => {
        if (!confirm("Delete this gold ledger entry?")) return;
        try {
            const res = await fetch(`/api/persons/${params.id}/gold-ledger?entryId=${entryId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");
            setGoldLedgerEntries((prev) => prev.filter((e) => e.id !== entryId));
            toast.success("Gold ledger entry deleted.");
        } catch {
            toast.error("Failed to delete entry.");
        }
    };

    const editLedgerEntry = (entry: GoldLedgerEntry) => {
        setEditingLedgerId(entry.id);
        setLedgerForm({
            type: entry.type,
            date: new Date(entry.date).toISOString().split("T")[0],
            grossWeight: entry.grossWeight.toString(),
            purity: entry.purity.toString(),
            wastageWeight: entry.wastageWeight.toString(),
            goldRate: entry.goldRate.toString(),
            notes: entry.notes || "",
        });
        setLedgerError("");
        setShowAddLedger(true);
    };

    return (
        <div className="space-y-6">
            {/* Back */}
            <Link href="/persons" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
                <ArrowLeft className="h-4 w-4" /> Back to Persons
            </Link>

            {/* Profile Card */}
            <div className="stat-card">
                <div className="flex items-start gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl gold-gradient text-2xl font-bold text-white shrink-0">
                        {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h2 className="font-display text-xl font-bold">{person.name}</h2>
                        <div className="mt-2 flex flex-wrap gap-3">
                            {person.phone && (
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Phone className="h-3.5 w-3.5" /> {person.phone}
                                </span>
                            )}
                            {person.email && (
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Mail className="h-3.5 w-3.5" /> {person.email}
                                </span>
                            )}
                            {person.address && (
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" /> {person.address}
                                </span>
                            )}
                        </div>
                        {person.notes && <p className="mt-2 text-sm text-muted-foreground italic">"{person.notes}"</p>}
                    </div>
                    <div className="flex gap-4 text-center">
                        <div>
                            <p className="font-mono text-xl font-bold">{formatCurrency(Math.abs(totalCash))}</p>
                            <p className={`text-xs font-medium ${totalCash >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {totalCash >= 0 ? "Net Received" : "Net Lent"}
                            </p>
                        </div>
                        <div>
                            <p className="font-mono text-xl font-bold gold-text">{formatWeight(Math.abs(totalGold))}</p>
                            <p className={`text-xs font-medium ${totalGold >= 0 ? "text-green-600" : "text-amber-600"}`}>
                                {totalGold >= 0 ? "Gold Received" : "Gold Lent"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Consolidated table — cash, gold and gold ledger entries */}

            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                <h3 className="text-base font-semibold">All Transactions</h3>
                <button
                    onClick={() => {
                        setEditingLedgerId(null);
                        setLedgerForm({
                            type: "RECEIVED",
                            date: new Date().toISOString().split("T")[0],
                            grossWeight: "0",
                            purity: "91.6",
                            notes: "",
                            wastageWeight: "0",
                            goldRate: getDefaultGoldRate().toString(),
                        });
                        setShowAddLedger(true);
                        setLedgerError("");
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Add Gold Ledger Entry
                </button>
            </div>
            <DataTableHeader search={dt.search} onSearchChange={dt.setSearch} pageSize={dt.pageSize} onPageSizeChange={dt.setPageSize} />
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            {["Date", "Particulars", "Category", "Type", "Issued", "Receipt", "Dr/Cr", "Cash Balance", "Gold Balance", "Notes", "Actions"].map((h) => (
                                <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {dt.data.length === 0 ? (
                            <tr><td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">No transactions available</td></tr>
                        ) : (
                            <>
                                {dt.data.map((row) => (
                                    <tr key={`${row.source}-${row.id}`} className="table-row-hover">
                                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{formatDate(row.date)}</td>
                                        <td className="px-3 py-2 font-mono">{row.particulars}</td>
                                        <td className="px-3 py-2">{row.source}</td>
                                        <td className="px-3 py-2">{row.type}</td>
                                        <td className="px-3 py-2 text-right font-mono">{row.cashIssued ? formatCurrency(row.cashIssued) : row.goldIssued ? formatWeight(row.goldIssued) : "-"}</td>
                                        <td className="px-3 py-2 text-right font-mono">{row.cashReceipt ? formatCurrency(row.cashReceipt) : row.goldReceipt ? formatWeight(row.goldReceipt) : "-"}</td>
                                        <td className="px-3 py-2 font-mono font-semibold">{row.drcr}</td>
                                        <td className="px-3 py-2 font-mono font-semibold">{formatCurrency(row.runningCash)}</td>
                                        <td className="px-3 py-2 font-mono font-semibold">{formatWeight(row.runningGold)}</td>
                                        <td className="px-3 py-2 text-muted-foreground max-w-[160px] truncate">{row.notes || "—"}</td>
                                        <td className="px-3 py-2">
                                            {row.source === "GoldLedger" ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => {
                                                            const entry = goldLedgerEntries.find((e) => e.id === row.id);
                                                            if (entry) editLedgerEntry(entry);
                                                        }}
                                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteLedgerEntry(row.id)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ) : row.invoiceUrl ? (
                                                <Link href={row.invoiceUrl} className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors">
                                                    <Printer className="h-3.5 w-3.5" />
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-muted/20 font-semibold">
                                    <td colSpan={4} className="px-3 py-2">Totals</td>
                                    <td className="px-3 py-2 text-right">{formatCurrency(totals.cashIssued)}</td>
                                    <td className="px-3 py-2 text-right">{formatCurrency(totals.cashReceipt)}</td>
                                    <td className="px-3 py-2">-</td>
                                    <td className="px-3 py-2 font-mono">{formatCurrency(totals.cashReceipt - totals.cashIssued)}</td>
                                    <td className="px-3 py-2 font-mono">{formatWeight(totals.goldReceipt - totals.goldIssued)}</td>
                                    <td className="px-3 py-2">-</td>
                                    <td className="px-3 py-2">-</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
            <DataTableFooter currentPage={dt.currentPage} totalPages={dt.totalPages} totalItems={dt.totalItems} from={dt.from} to={dt.to} onPageChange={dt.setCurrentPage} />

            {showAddLedger && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-lg font-semibold">{editingLedgerId ? "Edit Gold Ledger Entry" : "Add Gold Ledger Entry"}</h4>
                            <button onClick={() => { setShowAddLedger(false); setEditingLedgerId(null); }} className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Type</label>
                                <select value={ledgerForm.type} onChange={(e) => setLedgerForm((p) => ({ ...p, type: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                                    <option value="GIVEN">Given</option>
                                    <option value="RECEIVED">Received</option>
                                    <option value="PURCHASE">Purchase</option>
                                    <option value="SALE">Sale</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Date</label>
                                <input type="date" value={ledgerForm.date} onChange={(e) => setLedgerForm((p) => ({ ...p, date: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Gross Weight (g)</label>
                                <input type="number" min="0" step="0.001" value={ledgerForm.grossWeight}
                                    onChange={(e) => setLedgerForm((p) => ({ ...p, grossWeight: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Purity (%)</label>
                                <input type="number" min="0" step="0.01" value={ledgerForm.purity}
                                    onChange={(e) => setLedgerForm((p) => ({ ...p, purity: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs font-medium text-muted-foreground">Notes</label>
                                <input type="text" value={ledgerForm.notes} onChange={(e) => setLedgerForm((p) => ({ ...p, notes: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm" />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground">
                                    Gold Rate (₹/g)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={ledgerForm.goldRate}
                                    onChange={(e) =>
                                        setLedgerForm((p) => ({ ...p, goldRate: e.target.value }))
                                    }
                                    className="mt-1 w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-muted/10 p-3 text-xs">
                            <p>Pure Gold: <strong>{ledgerCalc.pure.toFixed(3)}g</strong></p>
                            <p>Wastage: <strong>{ledgerCalc.wastage.toFixed(3)}g</strong></p>
                            <p>Final Weight: <strong>{ledgerCalc.finalWeight.toFixed(3)}g</strong></p>
                            <p>Gold Rate: <strong>{ledgerCalc.rate ? formatCurrency(ledgerCalc.rate) : "—"}</strong></p>
                            <p>Total Value: <strong>{formatCurrency(ledgerCalc.totalAmount)}</strong></p>
                        </div>

                        {ledgerError && <p className="mt-2 text-sm text-red-600">{ledgerError}</p>}

                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => { setShowAddLedger(false); setEditingLedgerId(null); }} className="rounded-lg border border-border px-3 py-2 text-sm">Cancel</button>
                            <button onClick={createLedgerEntry} disabled={ledgerSubmitting}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                                {ledgerSubmitting ? "Saving..." : editingLedgerId ? "Update Entry" : "Save Entry"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
