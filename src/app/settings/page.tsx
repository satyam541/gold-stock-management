"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Save, Gem, ArrowLeftRight, Building2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaratOptionType, TransactionTypeOption } from "@/types";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<"carats" | "types" | "company">("carats");

    // ─── Carat Options ──────────────────────────────────
    const [carats, setCarats] = useState<CaratOptionType[]>([]);
    const [newCarat, setNewCarat] = useState({ value: "", label: "" });
    const [caratLoading, setCaratLoading] = useState(true);
    const [caratSaving, setCaratSaving] = useState(false);
    const [caratError, setCaratError] = useState("");
    const [caratSuccess, setCaratSuccess] = useState("");

    const fetchCarats = useCallback(async () => {
        setCaratLoading(true);
        try {
            const res = await fetch("/api/settings/carat-options");
            const data = await res.json();
            setCarats(Array.isArray(data) ? data : []);
        } finally {
            setCaratLoading(false);
        }
    }, []);

    useEffect(() => { fetchCarats(); }, [fetchCarats]);

    const addCarat = async () => {
        setCaratError(""); setCaratSuccess("");
        if (!newCarat.value.trim() || !newCarat.label.trim()) {
            setCaratError("Both value and label are required.");
            toast.error("Both value and label are required.");
            return;
        }
        setCaratSaving(true);
        try {
            const res = await fetch("/api/settings/carat-options", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newCarat, sortOrder: carats.length }),
            });
            if (!res.ok) {
                const err = await res.json();
                setCaratError(err.error || "Failed to add");
                toast.error(err.error || "Failed to add carat option.");
                return;
            }
            setNewCarat({ value: "", label: "" });
            setCaratSuccess("Carat option added successfully!");
            toast.success("Carat option added successfully!");
            fetchCarats();
        } finally {
            setCaratSaving(false);
        }
    };

    const deleteCarat = async (id: string) => {
        if (!confirm("Delete this carat option?")) return;
        await fetch(`/api/settings/carat-options/${id}`, { method: "DELETE" });
        toast.success("Carat option deleted.");
        fetchCarats();
    };

    const toggleCarat = async (id: string, isActive: boolean) => {
        await fetch(`/api/settings/carat-options/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !isActive }),
        });
        toast.success(`Carat option ${isActive ? "deactivated" : "activated"}.`);
        fetchCarats();
    };

    // ─── Transaction Types ──────────────────────────────
    const [types, setTypes] = useState<TransactionTypeOption[]>([]);
    const [newType, setNewType] = useState({ value: "", label: "", color: "#6b7280" });
    const [typeLoading, setTypeLoading] = useState(true);
    const [typeSaving, setTypeSaving] = useState(false);
    const [typeError, setTypeError] = useState("");
    const [typeSuccess, setTypeSuccess] = useState("");

    const fetchTypes = useCallback(async () => {
        setTypeLoading(true);
        try {
            const res = await fetch("/api/settings/transaction-types");
            const data = await res.json();
            setTypes(Array.isArray(data) ? data : []);
        } finally {
            setTypeLoading(false);
        }
    }, []);

    useEffect(() => { fetchTypes(); }, [fetchTypes]);

    const addType = async () => {
        setTypeError(""); setTypeSuccess("");
        if (!newType.value.trim() || !newType.label.trim()) {
            setTypeError("Both value and label are required.");
            toast.error("Both value and label are required.");
            return;
        }
        setTypeSaving(true);
        try {
            const res = await fetch("/api/settings/transaction-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newType, sortOrder: types.length }),
            });
            if (!res.ok) {
                const err = await res.json();
                setTypeError(err.error || "Failed to add");
                toast.error(err.error || "Failed to add transaction type.");
                return;
            }
            setNewType({ value: "", label: "", color: "#6b7280" });
            setTypeSuccess("Transaction type added successfully!");
            toast.success("Transaction type added successfully!");
            fetchTypes();
        } finally {
            setTypeSaving(false);
        }
    };

    const deleteType = async (id: string) => {
        if (!confirm("Delete this transaction type?")) return;
        await fetch(`/api/settings/transaction-types/${id}`, { method: "DELETE" });
        toast.success("Transaction type deleted.");
        fetchTypes();
    };

    const toggleType = async (id: string, isActive: boolean) => {
        await fetch(`/api/settings/transaction-types/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !isActive }),
        });
        toast.success(`Transaction type ${isActive ? "deactivated" : "activated"}.`);
        fetchTypes();
    };

    // ─── Company Settings ──────────────────────────────
    const [company, setCompany] = useState({
        company_name: "",
        company_phone: "",
        company_address: "",
        company_email: "",
    });
    const [companySaving, setCompanySaving] = useState(false);
    const [companySuccess, setCompanySuccess] = useState("");

    useEffect(() => {
        fetch("/api/settings/app")
            .then((r) => r.json())
            .then((data) => {
                if (data && typeof data === "object" && !data.error) {
                    setCompany((prev) => ({ ...prev, ...data }));
                }
            })
            .catch(() => { });
    }, []);

    const saveCompany = async () => {
        setCompanySaving(true);
        setCompanySuccess("");
        try {
            await fetch("/api/settings/app", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(company),
            });
            setCompanySuccess("Company settings saved!");
            toast.success("Company settings saved successfully!");
        } finally {
            setCompanySaving(false);
        }
    };

    const tabs = [
        { key: "carats" as const, label: "Carat Options", icon: Gem },
        { key: "types" as const, label: "Transaction Types", icon: ArrowLeftRight },
        { key: "company" as const, label: "Company Info", icon: Building2 },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={cn(
                            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                            activeTab === t.key
                                ? "bg-card shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <t.icon className="h-4 w-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Carat Options Tab ── */}
            {activeTab === "carats" && (
                <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-display text-lg font-semibold mb-1">Gold Carat Options</h3>
                        <p className="text-xs text-muted-foreground mb-5">
                            Manage the carat types available across the application. These will appear in all gold transaction forms and filters.
                        </p>

                        {/* Add new */}
                        <div className="flex items-end gap-3 mb-6 pb-6 border-b border-border">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Value</label>
                                <input
                                    type="text"
                                    value={newCarat.value}
                                    onChange={(e) => setNewCarat({ ...newCarat, value: e.target.value })}
                                    placeholder="e.g. 22k"
                                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                            <div className="flex-[2]">
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Label</label>
                                <input
                                    type="text"
                                    value={newCarat.label}
                                    onChange={(e) => setNewCarat({ ...newCarat, label: e.target.value })}
                                    placeholder="e.g. 22 Karat"
                                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                            <button
                                onClick={addCarat}
                                disabled={caratSaving}
                                className="flex items-center gap-2 h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" /> Add
                            </button>
                        </div>

                        {caratError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive mb-4">{caratError}</p>}
                        {caratSuccess && <p className="rounded-lg bg-green-500/10 px-3 py-2 text-xs font-medium text-green-600 mb-4">{caratSuccess}</p>}

                        {/* List */}
                        {caratLoading ? (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        ) : carats.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No carat options configured. Add one above to get started.</p>
                        ) : (
                            <div className="space-y-2">
                                {carats.map((c) => (
                                    <div
                                        key={c.id}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                                            c.isActive ? "border-border bg-background" : "border-border/50 bg-muted/30 opacity-60"
                                        )}
                                    >
                                        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                                            <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">{c.value}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{c.label}</p>
                                            <p className="text-xs text-muted-foreground">Value: {c.value}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleCarat(c.id, c.isActive)}
                                            className={cn(
                                                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                                c.isActive
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            )}
                                        >
                                            {c.isActive ? "Active" : "Inactive"}
                                        </button>
                                        <button
                                            onClick={() => deleteCarat(c.id)}
                                            className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Transaction Types Tab ── */}
            {activeTab === "types" && (
                <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-display text-lg font-semibold mb-1">Transaction Types</h3>
                        <p className="text-xs text-muted-foreground mb-5">
                            Manage transaction type categories. These appear in cash &amp; gold transaction forms and filters.
                        </p>

                        {/* Add new */}
                        <div className="flex items-end gap-3 mb-6 pb-6 border-b border-border">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Value (key)</label>
                                <input
                                    type="text"
                                    value={newType.value}
                                    onChange={(e) => setNewType({ ...newType, value: e.target.value })}
                                    placeholder="e.g. EXCHANGE"
                                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase"
                                />
                            </div>
                            <div className="flex-[2]">
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Label</label>
                                <input
                                    type="text"
                                    value={newType.label}
                                    onChange={(e) => setNewType({ ...newType, label: e.target.value })}
                                    placeholder="e.g. Exchange"
                                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Color</label>
                                <input
                                    type="color"
                                    value={newType.color}
                                    onChange={(e) => setNewType({ ...newType, color: e.target.value })}
                                    className="h-9 w-12 rounded-lg border border-border cursor-pointer"
                                />
                            </div>
                            <button
                                onClick={addType}
                                disabled={typeSaving}
                                className="flex items-center gap-2 h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" /> Add
                            </button>
                        </div>

                        {typeError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive mb-4">{typeError}</p>}
                        {typeSuccess && <p className="rounded-lg bg-green-500/10 px-3 py-2 text-xs font-medium text-green-600 mb-4">{typeSuccess}</p>}

                        {/* List */}
                        {typeLoading ? (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        ) : types.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No transaction types configured. Add one above.</p>
                        ) : (
                            <div className="space-y-2">
                                {types.map((t) => (
                                    <div
                                        key={t.id}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                                            t.isActive ? "border-border bg-background" : "border-border/50 bg-muted/30 opacity-60"
                                        )}
                                    >
                                        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                                        <div
                                            className="h-4 w-4 rounded-full shrink-0"
                                            style={{ backgroundColor: t.color }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{t.label}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{t.value}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleType(t.id, t.isActive)}
                                            className={cn(
                                                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                                t.isActive
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                            )}
                                        >
                                            {t.isActive ? "Active" : "Inactive"}
                                        </button>
                                        <button
                                            onClick={() => deleteType(t.id)}
                                            className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Company Info Tab ── */}
            {activeTab === "company" && (
                <div className="rounded-xl border border-border bg-card p-6 max-w-xl">
                    <h3 className="font-display text-lg font-semibold mb-1">Company Information</h3>
                    <p className="text-xs text-muted-foreground mb-5">
                        This information appears on printed bills and receipts.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Company Name</label>
                            <input
                                type="text"
                                value={company.company_name}
                                onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                                placeholder="AssetFlow Management"
                                className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone</label>
                            <input
                                type="text"
                                value={company.company_phone}
                                onChange={(e) => setCompany({ ...company, company_phone: e.target.value })}
                                placeholder="+92 XXX XXXXXXX"
                                className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                            <input
                                type="email"
                                value={company.company_email}
                                onChange={(e) => setCompany({ ...company, company_email: e.target.value })}
                                placeholder="info@company.com"
                                className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Address</label>
                            <textarea
                                value={company.company_address}
                                onChange={(e) => setCompany({ ...company, company_address: e.target.value })}
                                placeholder="Street, City, Country"
                                rows={3}
                                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                            />
                        </div>

                        {companySuccess && <p className="rounded-lg bg-green-500/10 px-3 py-2 text-xs font-medium text-green-600">{companySuccess}</p>}

                        <button
                            onClick={saveCompany}
                            disabled={companySaving}
                            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {companySaving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
