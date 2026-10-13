"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download, Receipt } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { TXN_FILTERS, walletService } from "@/lib/api/services/wallet.service";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Skeleton } from "@/components/ui/Skeleton";
import { openInvoiceWindow } from "../lib/invoice";
import { TransactionRow } from "./TransactionRow";
import { label as t } from "@/lib/labels";
import { SITE_LOCALE } from "@/config/locale";

const PAGE_SIZE = 10;

export function TransactionsView() {
  const locale = SITE_LOCALE;
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  // Keyed by filter so switching tabs shows a skeleton without a sync setState in an effect.
  const [reload, setReload] = useState(0);
  const [data, setData] = useState({ key: null, items: [], page: 0, hasMore: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const key = `${filter}:${reload}`;
  useEffect(() => {
    let alive = true;
    const reqKey = `${filter}:${reload}`;
    walletService
      .getTransactions({ page: 1, pageSize: PAGE_SIZE, type: filter })
      .then((r) => alive && setData({ key: reqKey, items: r.items, page: 1, hasMore: r.hasMore }))
      .catch((e) => {
        if (!alive) return;
        setError(e);
        setData({ key: reqKey, items: [], page: 1, hasMore: false });
      });
    return () => {
      alive = false;
    };
  }, [filter, reload]);

  const loading = data.key !== key;

  const loadMore = () => {
    setLoadingMore(true);
    walletService
      .getTransactions({ page: data.page + 1, pageSize: PAGE_SIZE, type: filter })
      .then((r) => setData((d) => ({ ...d, items: [...d.items, ...r.items], page: r.page, hasMore: r.hasMore })))
      .catch(() => setError(true))
      .finally(() => setLoadingMore(false));
  };

  const changeFilter = (f) => {
    setError(null);
    setFilter(f);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <LocaleLink href={routes.wallet} className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden /> Wallet
        </LocaleLink>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Transaction history</h1>
          <p className="text-sm text-muted">
            Wallet balance: <strong className="text-fg">{formatCurrency(user?.walletBalance ?? 0, locale)}</strong>
          </p>
        </div>
      </div>

      <div role="tablist" aria-label="Filter transactions" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {TXN_FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => changeFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
              filter === f
                ? "border-brand-600 bg-brand-600 text-white dark:border-gold-500 dark:bg-gold-500 dark:text-brand-950"
                : "border-line bg-surface text-muted hover:text-fg",
            )}
          >
            {t(`wallet.filter.${f}`)}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-4 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={error ? "Couldn't load transactions" : "Nothing here yet"}
            description={error ? null : "No transactions match this filter."}
            action={
              error ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setError(null);
                    setReload((n) => n + 1);
                  }}
                >
                  Try again
                </Button>
              ) : (
                <ButtonLink href={routes.wallet} variant="gold">
                  Add money
                </ButtonLink>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {data.items.map((txn) => (
              <TransactionRow
                key={txn.id}
                txn={txn}
                action={txn.type === "recharge" && txn.status === "success" ? <InvoiceButton txnId={txn.id} /> : null}
              />
            ))}
          </ul>
        )}
      </Card>

      {!loading && data.hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} loading={loadingMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}

function InvoiceButton({ txnId }) {
  const locale = SITE_LOCALE;
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const open = () => {
    const win = openInvoiceWindow("Loading…");
    if (!win) {
      toast({ type: "warning", title: "Please allow pop-ups to view the receipt" });
      return;
    }
    setBusy(true);
    walletService
      .getInvoice(txnId)
      .then((inv) => win.fill(inv, t, locale))
      .catch(() => {
        win.fail();
        toast({ type: "error", title: "Couldn't load the receipt" });
      })
      .finally(() => setBusy(false));
  };

  return (
    <button
      type="button"
      onClick={open}
      disabled={busy}
      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline disabled:opacity-50 dark:text-gold-400"
    >
      <Download className="size-3.5" aria-hidden /> Receipt
    </button>
  );
}
