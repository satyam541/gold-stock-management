import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CashTransaction, GoldTransaction } from "@/types";
import { formatCurrency, formatDate, formatWeight, getTransactionBadgeClass, getTransactionLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RecentTransactionsProps {
  cashTransactions: CashTransaction[];
  goldTransactions: GoldTransaction[];
}

export default function RecentTransactions({
  cashTransactions,
  goldTransactions,
}: RecentTransactionsProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="font-display text-base font-semibold">
          Recent Transactions
        </h3>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {cashTransactions.length === 0 && goldTransactions.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          <>
            {cashTransactions.slice(0, 3).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 px-6 py-3 table-row-hover"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <span className="text-sm font-bold text-green-700 dark:text-green-400">₨</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {tx.person?.name || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(tx.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold">
                    {formatCurrency(tx.amount)}
                  </p>
                  <span className={cn("text-xs", getTransactionBadgeClass(tx.type))}>
                    {getTransactionLabel(tx.type)}
                  </span>
                </div>
              </div>
            ))}

            {goldTransactions.slice(0, 3).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 px-6 py-3 table-row-hover"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Au</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {tx.person?.name || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.carat} · {formatDate(tx.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold">
                    {formatWeight(tx.weight)}
                  </p>
                  <span className={cn("text-xs", getTransactionBadgeClass(tx.type))}>
                    {getTransactionLabel(tx.type)}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
