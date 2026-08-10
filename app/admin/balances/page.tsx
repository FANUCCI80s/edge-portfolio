
"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

type UserBalance = {
  id: string;
  available: string | number;
  locked: string | number;
  updatedAt: string;
};

type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  balance: UserBalance | null;
};

type BalanceResponse = {
  success: boolean;
  users?: AdminUser[];
  message?: string;
};

export default function AdminBalancesPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [search, setSearch] = useState("");

  const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/balances", {
        method: "GET",
        cache: "no-store",
      });

      const result: BalanceResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load users."
        );
      }

      setUsers(result.users ?? []);
    } catch (err) {
      console.error("Admin balance page error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return users;
    }

    return users.filter((user) => {
      const fullName =
        `${user.firstName} ${user.lastName}`.toLowerCase();

      return (
        fullName.includes(value) ||
        user.email.toLowerCase().includes(value)
      );
    });
  }, [users, search]);

  const selectedUser = users.find(
    (user) => user.id === selectedUserId
  );

  function formatMoney(
    value: string | number | undefined
  ) {
    const numericValue = Number(value ?? 0);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(numericValue);
  }

  async function submitAdjustment() {
    setMessage("");
    setError("");

    if (!selectedUserId) {
      setError("Please select a user.");
      return;
    }

    const numericAmount = Number(amount);

    if (
      !amount.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    if (reason.trim().length === 0) {
      setError("A reason is required.");
      return;
    }

    if (reason.trim().length > 2000) {
      setError("The reason cannot exceed 2,000 characters.");
      return;
    }

    const action = type === "CREDIT" ? "credit" : "debit";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${formatMoney(
        numericAmount
      )} ${type === "CREDIT" ? "to" : "from"} ${
        selectedUser?.firstName ?? "this user"
      }'s account?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch("/api/admin/balances", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
          type,
          amount: amount.trim(),
          reason: reason.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to adjust balance."
        );
      }

      setMessage(
        result.message || "Balance updated successfully."
      );

      setAmount("");
      setReason("");

      await loadUsers();
    } catch (err) {
      console.error("Balance adjustment error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to adjust balance."
      );
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080a09] text-white">
        <AdminSidebar />

        <div className="min-h-screen lg:pl-[280px]">
          <div className="flex min-h-screen items-center justify-center px-6">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

              <p className="mt-4 text-sm text-zinc-500">
                Loading balance management...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080a09] text-white">
      <AdminSidebar />

      <div className="min-h-screen lg:pl-[280px]">
        <section className="min-w-0">
          {/* PAGE HEADER */}
          <header className="border-b border-white/10 bg-[#080a09] px-5 py-6 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-6xl">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                Administration
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Balance Management
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                Manage user account balances securely. Every
                adjustment is recorded in the transaction history
                and account activity log.
              </p>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
            {/* ALERTS */}
            {message && (
              <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* USER SELECTION */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                  Step 01
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Select User
                </h2>

                <p className="mt-1 text-sm text-zinc-600">
                  Select the customer whose available balance
                  you want to modify.
                </p>
              </div>

              <div className="mt-6">
                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by name or email..."
                  className="admin-input"
                />
              </div>

              <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-white/10">
                {filteredUsers.length === 0 ? (
                  <div className="p-6 text-center text-sm text-zinc-600">
                    No users found.
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected =
                      user.id === selectedUserId;

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() =>
                          setSelectedUserId(user.id)
                        }
                        className={`flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left transition last:border-b-0 ${
                          isSelected
                            ? "bg-emerald-400/10"
                            : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>

                          <p className="mt-1 truncate text-xs text-zinc-600">
                            {user.email}
                          </p>
                        </div>

                        <div className="ml-4 text-right">
                          <p className="text-sm font-semibold text-emerald-400">
                            {formatMoney(
                              user.balance?.available
                            )}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            Available
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            {/* CURRENT BALANCE */}
            {selectedUser && (
              <section className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                  Selected Account
                </p>

                <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {selectedUser.firstName}{" "}
                      {selectedUser.lastName}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      {selectedUser.email}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Available Balance
                    </p>

                    <p className="mt-1 text-3xl font-semibold text-emerald-400">
                      {formatMoney(
                        selectedUser.balance?.available
                      )}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Locked:{" "}
                      {formatMoney(
                        selectedUser.balance?.locked
                      )}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* BALANCE ADJUSTMENT */}
            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                  Step 02
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Balance Adjustment
                </h2>

                <p className="mt-1 text-sm text-zinc-600">
                  All balance changes require a reason and are
                  permanently recorded.
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {/* TYPE */}
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Adjustment Type
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setType("CREDIT")}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        type === "CREDIT"
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                          : "border-white/10 text-zinc-500 hover:text-white"
                      }`}
                    >
                      + Credit
                    </button>

                    <button
                      type="button"
                      onClick={() => setType("DEBIT")}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        type === "DEBIT"
                          ? "border-red-400/40 bg-red-400/10 text-red-400"
                          : "border-white/10 text-zinc-500 hover:text-white"
                      }`}
                    >
                      − Debit
                    </button>
                  </div>
                </div>

                {/* AMOUNT */}
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Amount
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.00000001"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="0.00"
                    className="admin-input"
                  />
                </div>

                {/* REASON */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm text-zinc-400">
                    Reason
                  </label>

                  <textarea
                    value={reason}
                    onChange={(event) =>
                      setReason(event.target.value)
                    }
                    rows={4}
                    maxLength={2000}
                    placeholder="Explain why this balance adjustment is being made..."
                    className="admin-input resize-none"
                  />

                  <p className="mt-2 text-xs text-zinc-600">
                    {reason.length}/2000
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={processing || !selectedUserId}
                  onClick={submitAdjustment}
                  className={`rounded-xl px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    type === "CREDIT"
                      ? "bg-emerald-500 text-black hover:bg-emerald-400"
                      : "bg-red-500 text-white hover:bg-red-400"
                  }`}
                >
                  {processing
                    ? "Processing..."
                    : type === "CREDIT"
                      ? "Credit User Balance"
                      : "Debit User Balance"}
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => {
                    setAmount("");
                    setReason("");
                    setError("");
                    setMessage("");
                  }}
                  className="rounded-xl border border-white/10 px-6 py-3 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </section>

            {/* AUDIT NOTICE */}
            <section className="mt-6 rounded-3xl border border-yellow-400/10 bg-yellow-400/[0.03] p-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400">
                  !
                </div>

                <div>
                  <h3 className="font-medium text-yellow-300">
                    Balance Adjustment Audit
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Every credit or debit should be permanently
                    recorded with the administrator, amount,
                    reason, transaction ID and timestamp. The
                    user can also be notified of the adjustment.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.3);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          transition: border-color 150ms ease;
        }

        .admin-input::placeholder {
          color: rgb(63 63 70);
        }

        .admin-input:focus {
          border-color: rgba(52, 211, 153, 0.5);
        }
      `}</style>
    </main>
  );
}

