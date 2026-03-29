"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin, Banknote, Gem, Printer } from "lucide-react";
import Link from "next/link";
import { Person, CashTransaction, GoldTransaction } from "@/types";
import { formatCurrency, formatDate, formatWeight, getTransactionBadgeClass, getTransactionLabel } from "@/lib/utils";

interface PersonDetail extends Person {
  cashTransactions: CashTransaction[];
  goldTransactions: GoldTransaction[];
}

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/persons/${params.id}`)
      .then((r) => r.json())
      .then((d) => { setPerson(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  if (!person) return <div className="text-muted-foreground p-4">Person not found.</div>;

  const totalCash = person.cashTransactions.reduce((sum, t) => {
    return t.type === "RECEIVED" || t.type === "DEPOSIT" ? sum + t.amount : sum - t.amount;
  }, 0);
  const totalGold = person.goldTransactions.reduce((sum, t) => {
    return t.type === "RECEIVED" || t.type === "DEPOSIT" ? sum + t.weight : sum - t.weight;
  }, 0);

  return (
    <div className="space-y-6 max-w-4xl">
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

      {/* Cash Transactions */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Banknote className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-display text-base font-semibold">Cash Transactions</h3>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{person.cashTransactions.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Type", "Amount", "Date", "Notes", ""].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {person.cashTransactions.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">No cash transactions</td></tr>
              ) : person.cashTransactions.map((tx) => (
                <tr key={tx.id} className="table-row-hover">
                  <td className="px-4 py-2"><span className={getTransactionBadgeClass(tx.type)}>{getTransactionLabel(tx.type)}</span></td>
                  <td className="px-4 py-2 font-mono text-sm font-semibold">{formatCurrency(tx.amount)}</td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">{formatDate(tx.date)}</td>
                  <td className="px-4 py-2 text-sm text-muted-foreground max-w-[200px] truncate">{tx.notes || "—"}</td>
                  <td className="px-4 py-2">
                    <Link href={`/bill/${tx.id}?type=cash`} className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors">
                      <Printer className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gold Transactions */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Gem className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-display text-base font-semibold">Gold Transactions</h3>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{person.goldTransactions.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Carat", "Weight", "Rate/g", "Total", "Type", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {person.goldTransactions.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">No gold transactions</td></tr>
              ) : person.goldTransactions.map((tx) => (
                <tr key={tx.id} className="table-row-hover">
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{tx.carat}</span>
                  </td>
                  <td className="px-4 py-2 font-mono text-sm font-semibold">{formatWeight(tx.weight)}</td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">{tx.ratePerGram ? formatCurrency(tx.ratePerGram) : "—"}</td>
                  <td className="px-4 py-2 font-mono text-sm">{tx.totalValue ? formatCurrency(tx.totalValue) : "—"}</td>
                  <td className="px-4 py-2"><span className={getTransactionBadgeClass(tx.type)}>{getTransactionLabel(tx.type)}</span></td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">{formatDate(tx.date)}</td>
                  <td className="px-4 py-2">
                    <Link href={`/bill/${tx.id}?type=gold`} className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted transition-colors">
                      <Printer className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
