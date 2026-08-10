"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

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
  amount: string | number;
  currency: string;
  description: string | null;
  reference: string | null;
  createdAt: string;
  completedAt: string | null;

  deposit?: {
    id: string;
    method: string;
  } | null;

  withdrawal?: {
    id: string;
    method: string;
  } | null;

  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

type ApiResponse = {
  transactions?: Transaction[];
  error?: string;
};

const TYPE_OPTIONS: Array<{
  value: "" | TransactionType;
  label: string;
}> = [
  { value: "", label: "All transaction types" },
  { value: "DEPOSIT", label: "Deposit" },
  { value: "WITHDRAWAL", label: "Withdrawal" },
  { value: "TRADE", label: "Trade" },
  { value: "REFUND", label: "Refund" },
  { value: "ADJUSTMENT", label: "Adjustment" },
];

const STATUS_OPTIONS: Array<{
  value: "" | TransactionStatus;
  label: string;
}> = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REVERSED", label: "Reversed" },
];

function formatAmount(
  amount: string | number,
  currency: string
): string {
  const numericAmount =
    typeof amount === "number"
      ? amount
      : Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return `${currency} 0.00`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(numericAmount);
  } catch {
    return `${currency || "USD"} ${numericAmount.toLocaleString()}`;
  }
}

function formatDate(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeLabel(type: TransactionType): string {
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
      return "Adjustment";
    default:
      return type;
  }
}

function getStatusLabel(status: TransactionStatus): string {
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

function getMethodLabel(method: string | null | undefined): string {
  if (!method) {
    return "—";
  }

  switch (method) {
    case "BANK_TRANSFER":
      return "Bank Transfer";
    case "CARD":
      return "Card";
    case "CRYPTOCURRENCY":
      return "Cryptocurrency";
    case "CASH_APP":
      return "Cash App";
    case "PAYPAL":
      return "PayPal";
    case "ZELLE":
      return "Zelle";
    case "VENMO":
      return "Venmo";
    default:
      return method
        .toLowerCase()
        .split("_")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
  }
}

function getTransactionMethod(transaction: Transaction): string {
  if (transaction.type === "DEPOSIT") {
    return getMethodLabel(transaction.deposit?.method);
  }

  if (transaction.type === "WITHDRAWAL") {
    return getMethodLabel(transaction.withdrawal?.method);
  }

  return "—";
}

function getStatusClass(status: TransactionStatus): string {
  switch (status) {
    case "COMPLETED":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "FAILED":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "REVERSED":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    default:
      return "bg-white/5 text-gray-300 border-white/10";
  }
}

function getTypeClass(type: TransactionType): string {
  switch (type) {
    case "DEPOSIT":
      return "text-green-400";
    case "WITHDRAWAL":
      return "text-red-400";
    case "TRADE":
      return "text-blue-400";
    case "REFUND":
      return "text-purple-400";
    case "ADJUSTMENT":
      return "text-yellow-400";
    default:
      return "text-gray-300";
  }
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "" | TransactionType
  >("");
  const [statusFilter, setStatusFilter] = useState<
    "" | TransactionStatus
  >("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(
    async (showRefreshState = false) => {
      try {
        if (showRefreshState) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (typeFilter) {
          params.set("type", typeFilter);
        }

        if (statusFilter) {
          params.set("status", statusFilter);
        }

        const queryString = params.toString();

        const response = await fetch(
          `/api/admin/transactions${
            queryString ? `?${queryString}` : ""
          }`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load transactions."
          );
        }

        setTransactions(data.transactions || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load transactions."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, typeFilter, statusFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTransactions();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchValue = search.trim().toLowerCase();

      if (!searchValue) {
        return true;
      }

      const userName =
        `${transaction.user.firstName} ${transaction.user.lastName}`
          .toLowerCase();

      const email =
        transaction.user.email.toLowerCase();

      const reference =
        transaction.reference?.toLowerCase() || "";

      const transactionId =
        transaction.id.toLowerCase();

      const description =
        transaction.description?.toLowerCase() || "";

      const method =
        getTransactionMethod(transaction).toLowerCase();

      return (
        userName.includes(searchValue) ||
        email.includes(searchValue) ||
        reference.includes(searchValue) ||
        transactionId.includes(searchValue) ||
        description.includes(searchValue) ||
        method.includes(searchValue)
      );
    });
  }, [transactions, search]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce(
      (total, transaction) => {
        const value = Number(transaction.amount);

        return Number.isFinite(value)
          ? total + value
          : total;
      },
      0
    );
  }, [filteredTransactions]);

  return (
    <main className="min-h-screen bg-[#050806] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-green-400">
              Admin Panel
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Transactions
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Review and monitor all platform transactions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadTransactions(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-gray-400">
              Transactions
            </p>

            <p className="mt-2 text-2xl font-bold">
              {filteredTransactions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-gray-400">
              Total Amount
            </p>

            <p className="mt-2 text-2xl font-bold text-green-400">
              {formatAmount(totalAmount, "USD")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-gray-400">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {
                filteredTransactions.filter(
                  (transaction) =>
                    transaction.status === "PENDING"
                ).length
              }
            </p>
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]">
            <div>
              <label
                htmlFor="transaction-search"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Search transactions
              </label>

              <input
                id="transaction-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search user, email, reference, ID..."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-green-500/50"
              />
            </div>

            <div>
              <label
                htmlFor="transaction-type"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Type
              </label>

              <select
                id="transaction-type"
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value as
                      | ""
                      | TransactionType
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-green-500/50"
              >
                {TYPE_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-[#0a0f0c]"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="transaction-status"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Status
              </label>

              <select
                id="transaction-status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | ""
                      | TransactionStatus
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-green-500/50"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-[#0a0f0c]"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("");
                  setStatusFilter("");
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white lg:w-auto"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-4 font-medium">
                    Transaction
                  </th>

                  <th className="px-5 py-4 font-medium">
                    User
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Type
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Method
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Amount
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-sm text-gray-500"
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center"
                    >
                      <div className="text-sm font-medium text-gray-300">
                        No transactions found
                      </div>

                      <div className="mt-1 text-sm text-gray-500">
                        Try changing your search or filters.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(
                    (transaction) => (
                      <tr
                        key={transaction.id}
                        className="transition hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-5">
                          <div className="max-w-[190px]">
                            <p className="truncate text-sm font-medium text-white">
                              {transaction.description ||
                                getTypeLabel(
                                  transaction.type
                                )}
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-500">
                              {transaction.reference ||
                                transaction.id}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <Link
                            href={`/admin/users/${transaction.user.id}`}
                            className="block min-w-[180px] transition hover:text-green-400"
                          >
                            <p className="text-sm font-medium text-white">
                              {
                                transaction.user
                                  .firstName
                              }{" "}
                              {
                                transaction.user
                                  .lastName
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {transaction.user.email}
                            </p>
                          </Link>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`text-sm font-semibold ${getTypeClass(
                              transaction.type
                            )}`}
                          >
                            {getTypeLabel(
                              transaction.type
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span className="text-sm text-gray-300">
                            {getTransactionMethod(
                              transaction
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span className="whitespace-nowrap text-sm font-semibold text-white">
                            {formatAmount(
                              transaction.amount,
                              transaction.currency
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                              transaction.status
                            )}`}
                          >
                            {getStatusLabel(
                              transaction.status
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <span className="whitespace-nowrap text-sm text-gray-400">
                            {formatDate(
                              transaction.createdAt
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-right">
                          <Link
                            href={`/admin/transactions/${transaction.id}`}
                            className="inline-flex rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-400 transition hover:bg-green-500/20"
                          >
                            View details
                          </Link>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}