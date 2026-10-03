"use client";

import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { routes } from "@/config/routes";
import { walletService } from "@/lib/api/services/wallet.service";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { TransactionRow } from "./TransactionRow";

/** Last few transactions on the wallet page. `refreshKey` (e.g. balance) triggers a refetch. */
export function RecentTransactions({ refreshKey }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let alive = true;
    walletService
      .getTransactions({ page: 1, pageSize: 5 })
      .then((r) => alive && setItems(r.items))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  return (
    <Card as="section" aria-labelledby="recent-heading" className="p-5">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 id="recent-heading" className="text-lg font-semibold">
          Recent transactions
        </h2>
        <LocaleLink href={routes.walletTransactions} className="text-sm font-semibold text-brand-600 hover:underline dark:text-gold-400">
          View all →
        </LocaleLink>
      </div>
      {items === null ? (
        <div className="space-y-3 py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : items.length ? (
        <ul className="divide-y divide-line">
          {items.map((txn) => (
            <TransactionRow key={txn.id} txn={txn} compact />
          ))}
        </ul>
      ) : (
        <EmptyState icon={Receipt} title="No transactions yet" description="Your recharges and consultations will appear here." className="py-8" />
      )}
    </Card>
  );
}
