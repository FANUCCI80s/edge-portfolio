"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRADE"
  | "REFUND"
  | "ADJUSTMENT";

type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REVERSED";

type Transaction = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  currency: string;
  description: string | null;
  reference: string | null;
  completedAt: string | null;
  createdAt: string;
  depositId: string | null;
  withdrawalId: string | null;
};

type FilterType = "ALL" | TransactionType;

const filters: Array<{
  value: FilterType;
  label: string;
}> = [
  {
    value: "ALL",
    label: "All",
  },
  {
    value: "DEPOSIT",
    label: "Deposits",
  },
  {
    value: "WITHDRAWAL",
    label: "Withdrawals",
  },
  {
    value: "TRADE",
    label: "Trades",
  },
  {
    value: "REFUND",
    label: "Refunds",
  },
  {
    value: "ADJUSTMENT",
    label: "Adjustments",
  },
];

function formatType(type: TransactionType) {
  switch (type) {
    case "DEPOSIT":
      return "Deposit";
    case "WITHDRAWAL":
      return "Withdrawal";
    case "TRADE":
      return "Trade";
    case "REFUND":
      return "Refund";
    case "ADJUSTMENT":
      return "Balance adjustment";
    default:
      return type;
  }
}

function formatStatus(status: TransactionStatus) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Failed";
    case "REVERSED":
      return "Reversed";
    default:
      return status;
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getStatusClass(status: TransactionStatus) {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "PENDING":
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";
    case "FAILED":
      return "border-red-400/20 bg-red-400/10 text-red-300";
    case "REVERSED":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";
    default:
      return "border-white/10 bg-white/[0.04] text-zinc-400";
  }
}

function getTypeIcon(type: TransactionType) {
  switch (type) {
    case "DEPOSIT":
      return "↓";
    case "WITHDRAWAL":
      return "↑";
    case "TRADE":
      return "↗";
    case "REFUND":
      return "↩";
    case "ADJUSTMENT":
      return "↔";
    default:
      return "•";
  }
}

function getAmountClass(type: TransactionType) {
  if (
    type === "DEPOSIT" ||
    type === "REFUND" ||
    type === "ADJUSTMENT"
  ) {
    return "text-emerald-400";
  }

  if (type === "WITHDRAWAL") {
    return "text-red-300";
  }

  return "text-white";
}

export default function TransactionsClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/transactions", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load transactions."
        );
      }

      setTransactions(
        Array.isArray(data.transactions)
          ? data.transactions
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (filter === "ALL") {
      return transactions;
    }

    return transactions.filter(
      (transaction) => transaction.type === filter
    );
  }, [transactions, filter]);

  return (
    <div className="min-h-screen bg-[#050706] text-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#080a09] lg:flex lg:flex-col">
          <div className="border-b border-white/10 p-5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
                <span className="font-bold text-emerald-400">
                  E
                </span>
              </div>

              <div>
                <p className="font-semibold tracking-tight">
                  Edge Portfolio
                </p>

                <p className="text-xs text-zinc-500">
                  Trading platform
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>⌂</span>
              Dashboard
            </Link>

            <Link
              href="/trade"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>↗</span>
              Trade
            </Link>

            <Link
              href="/deposit"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>↓</span>
              Deposit
            </Link>

            <Link
              href="/withdraw"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>↑</span>
              Withdraw
            </Link>

            <Link
              href="/transactions"
              className="flex items-center gap-3 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-400"
            >
              <span>↔</span>
              Transactions
            </Link>

            <div className="my-5 border-t border-white/10" />

            <Link
              href="/notifications"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>●</span>
              Notifications
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>⚙</span>
              Settings
            </Link>
          </nav>

          <div className="border-t border-white/10 p-4">
            <Link
              href="/dashboard"
              className="block rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-zinc-400 transition hover:border-white/20 hover:text-white"
            >
              Back to dashboard
            </Link>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">

          {/* Mobile header */}
          <header className="border-b border-white/10 bg-[#080a09] px-5 py-4 lg:hidden">
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10">
                  <span className="font-bold text-emerald-400">
                    E
                  </span>
                </div>

                <span className="font-semibold">
                  Edge Portfolio
                </span>
              </Link>

              <Link
                href="/dashboard"
                className="text-sm text-zinc-500 hover:text-white"
              >
                Dashboard
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">

            {/* Header */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-emerald-400">
                Account activity
              </p>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Transactions
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                View your deposits, withdrawals, trades,
                refunds, and other account transactions.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-red-300">
                      Unable to load transactions
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadTransactions}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:border-white/20 hover:text-white"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
              <div className="flex gap-1 overflow-x-auto">
                {filters.map((item) => {
                  const selected = filter === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilter(item.value)}
                      className={`shrink-0 rounded-xl px-4 py-2.5 text-sm transition ${
                        selected
                          ? "bg-emerald-400/10 font-medium text-emerald-400"
                          : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Transactions */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

              <div className="border-b border-white/10 px-6 py-5 sm:px-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="font-semibold">
                      Transaction history
                    </h2>

                    <p className="mt-1 text-xs text-zinc-600">
                      {loading
                        ? "Loading..."
                        : `${filteredTransactions.length} transaction${
                            filteredTransactions.length === 1
                              ? ""
                              : "s"
                          }`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadTransactions}
                    disabled={loading}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="px-6 py-16 text-center sm:px-8">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

                  <p className="mt-4 text-sm text-zinc-500">
                    Loading transaction history...
                  </p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="px-6 py-16 text-center sm:px-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xl text-zinc-500">
                    ↔
                  </div>

                  <h3 className="mt-5 font-medium">
                    No transactions found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                    Your transaction history will appear here
                    after you make a deposit, withdrawal,
                    trade, or other account transaction.
                  </p>

                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                      href="/deposit"
                      className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                    >
                      Make a deposit
                    </Link>

                    <Link
                      href="/withdraw"
                      className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
                    >
                      Request withdrawal
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-600">
                          <th className="px-6 py-4 font-medium sm:px-8">
                            Transaction
                          </th>

                          <th className="px-6 py-4 font-medium">
                            Status
                          </th>

                          <th className="px-6 py-4 text-right font-medium">
                            Amount
                          </th>

                          <th className="px-6 py-4 text-right font-medium sm:px-8">
                            Date
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-white/[0.06] last:border-0"
                          >
                            <td className="px-6 py-5 sm:px-8">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm text-zinc-400">
                                  {getTypeIcon(transaction.type)}
                                </div>

                                <div className="min-w-0">
                                  <p className="font-medium">
                                    {formatType(transaction.type)}
                                  </p>

                                  <p className="mt-1 max-w-sm truncate text-xs text-zinc-600">
                                    {transaction.description ||
                                      transaction.reference ||
                                      "Account transaction"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                  transaction.status
                                )}`}
                              >
                                {formatStatus(transaction.status)}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-right">
                              <p
                                className={`font-medium ${getAmountClass(
                                  transaction.type
                                )}`}
                              >
                                {transaction.type === "WITHDRAWAL" ||
                                transaction.type === "TRADE"
                                  ? "-"
                                  : "+"}
                                $
                                {Number(transaction.amount).toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </p>

                              <p className="mt-1 text-xs text-zinc-600">
                                {transaction.currency}
                              </p>
                            </td>

                            <td className="px-6 py-5 text-right sm:px-8">
                              <p className="text-sm text-zinc-300">
                                {formatDate(transaction.createdAt)}
                              </p>

                              {transaction.reference && (
                                <p className="mt-1 max-w-40 truncate text-xs text-zinc-600">
                                  Ref: {transaction.reference}
                                </p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="divide-y divide-white/[0.06] md:hidden">
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm text-zinc-400">
                              {getTypeIcon(transaction.type)}
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium">
                                {formatType(transaction.type)}
                              </p>

                              <p className="mt-1 truncate text-xs text-zinc-600">
                                {transaction.description ||
                                  transaction.reference ||
                                  "Account transaction"}
                              </p>
                            </div>
                          </div>

                          <p
                            className={`shrink-0 font-medium ${getAmountClass(
                              transaction.type
                            )}`}
                          >
                            {transaction.type === "WITHDRAWAL" ||
                            transaction.type === "TRADE"
                              ? "-"
                              : "+"}
                            $
                            {Number(transaction.amount).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              transaction.status
                            )}`}
                          >
                            {formatStatus(transaction.status)}
                          </span>

                          <span className="text-xs text-zinc-600">
                            {formatDate(transaction.createdAt)}
                          </span>
                        </div>

                        {transaction.reference && (
                          <p className="mt-3 text-xs text-zinc-600">
                            Reference: {transaction.reference}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}