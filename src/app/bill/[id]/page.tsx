"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Printer, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatWeight, formatDateTime, getTransactionLabel } from "@/lib/utils";
import { CashTransaction, GoldTransaction } from "@/types";

const COMPANY = {
  name: "AssetFlow Management",
  tagline: "Gold & Financial Asset Services",
  phone: "+92 300 0000000",
  address: "Main Market, Lahore, Pakistan",
  email: "info@assetflow.pk",
};

export default function BillPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "cash";
  const id = params.id as string;

  const [transaction, setTransaction] = useState<CashTransaction | GoldTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url =
      type === "cash"
        ? `/api/cash-transactions/${id}`
        : `/api/gold-transactions/${id}`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => { setTransaction(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, type]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Bill-${transaction?.billNumber || id}`,
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      Loading bill...
    </div>
  );

  if (!transaction) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-muted-foreground">Transaction not found.</p>
      <Link href="/transactions" className="text-sm text-primary hover:underline">← Back to Transactions</Link>
    </div>
  );

  const isCash = type === "cash";
  const cashTx = isCash ? (transaction as CashTransaction) : null;
  const goldTx = !isCash ? (transaction as GoldTransaction) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Action Bar */}
      <div className="no-print flex items-center justify-between">
        <Link
          href="/transactions"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Transactions
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Printer className="h-4 w-4" /> Print Receipt
        </button>
      </div>

      {/* Printable Bill */}
      <div
        ref={printRef}
        className="rounded-2xl border border-border bg-white text-black p-8 shadow-sm font-sans"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-amber-400">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white font-bold text-xl">
                AF
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {COMPANY.name}
                </h1>
                <p className="text-xs text-gray-500">{COMPANY.tagline}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-0.5">
              <p>{COMPANY.address}</p>
              <p>{COMPANY.phone} · {COMPANY.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block rounded-lg bg-amber-50 border border-amber-200 px-4 py-2">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                {isCash ? "Cash Receipt" : "Gold Receipt"}
              </p>
            </div>
            <p className="mt-2 text-2xl font-mono font-bold text-gray-900">
              #{transaction.billNumber?.slice(-8)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDateTime(transaction.date)}
            </p>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">FROM</p>
            <p className="font-semibold text-gray-900">{COMPANY.name}</p>
            <p className="text-sm text-gray-600">{COMPANY.address}</p>
            <p className="text-sm text-gray-600">{COMPANY.phone}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">TO / FROM</p>
            <p className="font-semibold text-gray-900">{transaction.person?.name}</p>
            {transaction.person?.phone && <p className="text-sm text-gray-600">{transaction.person.phone}</p>}
            {transaction.person?.address && <p className="text-sm text-gray-600">{transaction.person.address}</p>}
          </div>
        </div>

        {/* Transaction Details Table */}
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-2 text-xs font-semibold uppercase text-gray-500 border border-gray-200">Description</th>
              {!isCash && (
                <>
                  <th className="text-center px-4 py-2 text-xs font-semibold uppercase text-gray-500 border border-gray-200">Carat</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold uppercase text-gray-500 border border-gray-200">Weight</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold uppercase text-gray-500 border border-gray-200">Rate/g</th>
                </>
              )}
              <th className="text-right px-4 py-2 text-xs font-semibold uppercase text-gray-500 border border-gray-200">
                {isCash ? "Amount" : "Total Value"}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 border border-gray-200">
                <p className="font-medium text-gray-900">
                  {getTransactionLabel(transaction.type)} — {isCash ? "Cash" : "Gold"}
                </p>
                {transaction.notes && (
                  <p className="text-sm text-gray-500 mt-0.5">{transaction.notes}</p>
                )}
              </td>
              {goldTx && (
                <>
                  <td className="px-4 py-3 text-center border border-gray-200">
                    <span className="font-semibold text-amber-700">{goldTx.carat}</span>
                  </td>
                  <td className="px-4 py-3 text-right border border-gray-200 font-mono">
                    {formatWeight(goldTx.weight)}
                  </td>
                  <td className="px-4 py-3 text-right border border-gray-200 font-mono text-sm text-gray-600">
                    {goldTx.ratePerGram ? formatCurrency(goldTx.ratePerGram) : "—"}
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-right border border-gray-200">
                <span className="font-mono font-bold text-gray-900">
                  {isCash
                    ? formatCurrency(cashTx!.amount)
                    : goldTx?.totalValue
                    ? formatCurrency(goldTx.totalValue)
                    : formatWeight(goldTx!.weight)}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-amber-50">
              <td className={`px-4 py-3 font-semibold border border-gray-200 ${!isCash ? "col-span-1" : ""}`} colSpan={isCash ? 1 : 3}>
                Total
              </td>
              {!isCash && <td className="border border-gray-200" />}
              <td className="px-4 py-3 text-right font-mono font-bold text-lg text-amber-700 border border-gray-200">
                {isCash
                  ? formatCurrency(cashTx!.amount)
                  : goldTx?.totalValue
                  ? formatCurrency(goldTx.totalValue)
                  : formatWeight(goldTx!.weight)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Status Badge */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm font-medium text-green-700">Transaction Recorded</span>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Generated: {formatDateTime(new Date().toISOString())}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-dashed border-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-10">
                <p className="text-xs text-gray-500">Authorized Signature</p>
                <p className="text-xs font-medium text-gray-700">{COMPANY.name}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-10">
                <p className="text-xs text-gray-500">Received By</p>
                <p className="text-xs font-medium text-gray-700">{transaction.person?.name}</p>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            This is a computer-generated receipt. For queries: {COMPANY.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
