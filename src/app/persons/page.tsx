"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Search, Phone, Mail, MapPin, Eye, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface PersonWithCount {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  _count?: { cashTransactions: number; goldTransactions: number };
}

export default function PersonsPage() {
  const [persons, setPersons] = useState<PersonWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ phone: "", email: "", address: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const fetchPersons = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/persons${params}`);
      const data = await res.json();
      setPersons(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchPersons, 300);
    return () => clearTimeout(t);
  }, [fetchPersons]);

  const startEdit = (p: PersonWithCount) => {
    setEditingId(p.id);
    setEditForm({ phone: p.phone || "", email: p.email || "", address: p.address || "", notes: p.notes || "" });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const person = persons.find((p) => p.id === id);
      await fetch(`/api/persons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: person?.name, ...editForm }),
      });
      setEditingId(null);
      fetchPersons();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient shrink-0">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Person Directory</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Persons are created automatically when you record a cash or gold transaction — just type their name in the transaction form. You can optionally add contact details here.
            </p>
          </div>
          <div className="ml-auto shrink-0 text-right">
            <p className="font-display text-2xl font-bold">{persons.length}</p>
            <p className="text-xs text-muted-foreground">total persons</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="h-9 w-full rounded-lg border border-border bg-card pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Persons list */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : persons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            {search ? "No persons match your search" : "No persons yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Persons are created automatically when you record a transaction.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/cash" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Record Cash Transaction
            </Link>
            <Link href="/gold" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              Record Gold Transaction
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {persons.map((p, i) => (
            <div
              key={p.id}
              className="stat-card opacity-0 animate-fade-in"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "forwards" }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gold-gradient text-sm font-bold text-white shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold leading-tight">{p.name}</h3>
                    <p className="text-[10px] text-muted-foreground">Added {formatDate(p.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/persons/${p.id}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
                    title="View transactions"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  {editingId !== p.id && (
                    <button
                      onClick={() => startEdit(p)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
                      title="Edit contact details"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Inline edit mode */}
              {editingId === p.id ? (
                <div className="space-y-2">
                  {[
                    { field: "phone", placeholder: "Phone number" },
                    { field: "email", placeholder: "Email address" },
                    { field: "address", placeholder: "Address / City" },
                    { field: "notes", placeholder: "Notes" },
                  ].map(({ field, placeholder }) => (
                    <input
                      key={field}
                      type="text"
                      value={editForm[field as keyof typeof editForm]}
                      onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full h-8 rounded-md border border-border bg-muted/30 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                  ))}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => saveEdit(p.id)}
                      disabled={saving}
                      className="flex flex-1 items-center justify-center gap-1 rounded-md bg-primary py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Check className="h-3 w-3" /> {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      <X className="h-3 w-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Contact info */}
                  <div className="space-y-1 mb-3 min-h-[40px]">
                    {p.phone ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" /><span>{p.phone}</span>
                      </div>
                    ) : null}
                    {p.email ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 shrink-0" /><span className="truncate">{p.email}</span>
                      </div>
                    ) : null}
                    {p.address ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{p.address}</span>
                      </div>
                    ) : null}
                    {!p.phone && !p.email && !p.address && (
                      <button onClick={() => startEdit(p)} className="text-xs text-muted-foreground/60 hover:text-primary transition-colors">
                        + Add contact details
                      </button>
                    )}
                  </div>

                  {/* Transaction counts */}
                  <div className="flex gap-4 border-t border-border pt-3">
                    <div>
                      <p className="font-mono text-sm font-bold">{p._count?.cashTransactions || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Cash Tx</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm font-bold">{p._count?.goldTransactions || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Gold Tx</p>
                    </div>
                    <Link href={`/persons/${p.id}`} className="ml-auto flex items-center text-xs font-medium text-primary hover:underline">
                      View all →
                    </Link>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
