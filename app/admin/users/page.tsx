"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  createdAt: string;
  kyc: {
    status: string;
  } | null;
  balance: {
    available: number;
    total: number;
  } | null;
};

type Filter = "ALL" | "ACTIVE" | "PENDING" | "BLOCKED";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/users", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load users."
          );
        }

        setUsers(data.users || []);
      } catch (error) {
        console.error("Users page error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load users."
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`
          .trim()
          .toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (filter === "ACTIVE") {
        return user.status === "ACTIVE";
      }

      if (filter === "BLOCKED") {
        return (
          user.status === "BLOCKED" ||
          user.status === "SUSPENDED"
        );
      }

      if (filter === "PENDING") {
        return (
          user.kyc?.status === "PENDING" ||
          user.status === "PENDING"
        );
      }

      return true;
    });
  }, [users, search, filter]);

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const pendingUsers = users.filter(
    (user) =>
      user.kyc?.status === "PENDING" ||
      user.status === "PENDING"
  ).length;

  const blockedUsers = users.filter(
    (user) =>
      user.status === "BLOCKED" ||
      user.status === "SUSPENDED"
  ).length;

  function getFullName(user: User) {
    const name =
      `${user.firstName || ""} ${user.lastName || ""}`.trim();

    return name || "Unnamed user";
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-400/10 text-emerald-400";

      case "BLOCKED":
      case "SUSPENDED":
        return "bg-red-400/10 text-red-400";

      case "PENDING":
        return "bg-yellow-400/10 text-yellow-400";

      default:
        return "bg-white/10 text-zinc-400";
    }
  }

  function getKycClass(status?: string) {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-400/10 text-emerald-400";

      case "REJECTED":
        return "bg-red-400/10 text-red-400";

      case "PENDING":
        return "bg-yellow-400/10 text-yellow-400";

      default:
        return "bg-white/10 text-zinc-500";
    }
  }

  return (
    <main className="min-h-screen bg-[#050706] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm text-emerald-400 transition hover:text-emerald-300"
            >
              ← Admin Dashboard
            </Link>

            <p className="mt-5 text-sm font-medium text-emerald-400">
              User management
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Users
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Manage registered Edge Portfolio users,
              account status, KYC status, and balances.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-zinc-500">
              Total users
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {totalUsers}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Registered accounts
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.05] p-6">
            <p className="text-sm text-zinc-500">
              Active users
            </p>

            <p className="mt-3 text-3xl font-semibold text-emerald-400">
              {activeUsers}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Currently active accounts
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-400/10 bg-yellow-400/[0.03] p-6">
            <p className="text-sm text-zinc-500">
              Pending
            </p>

            <p className="mt-3 text-3xl font-semibold text-yellow-400">
              {pendingUsers}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Users requiring attention
            </p>
          </div>

          <div className="rounded-3xl border border-red-400/10 bg-red-400/[0.03] p-6">
            <p className="text-sm text-zinc-500">
              Blocked
            </p>

            <p className="mt-3 text-3xl font-semibold text-red-400">
              {blockedUsers}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Restricted accounts
            </p>
          </div>
        </div>

        {/* Controls */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, email, or user ID..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-emerald-400/40"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["ALL", "All"],
                  ["ACTIVE", "Active"],
                  ["PENDING", "Pending"],
                  ["BLOCKED", "Blocked"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    filter === value
                      ? "bg-emerald-500 text-black"
                      : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-emerald-400/30 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Users */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">
                  Accounts
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Registered users
                </h2>
              </div>

              <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-zinc-500">
                {filteredUsers.length} results
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

              <p className="mt-4 text-sm text-zinc-500">
                Loading users...
              </p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-400/10 text-red-400">
                !
              </div>

              <h3 className="mt-4 font-medium">
                Unable to load users
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                {error}
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-zinc-500">
                ◌
              </div>

              <h3 className="mt-4 font-medium">
                No users found
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-600">
                      <th className="px-6 py-4 font-medium">
                        User
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-6 py-4 font-medium">
                        KYC
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Balance
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Joined
                      </th>

                      <th className="px-6 py-4 text-right font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 font-semibold text-emerald-400">
                              {(
                                user.firstName ||
                                user.email ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {getFullName(user)}
                              </p>

                              <p className="mt-1 max-w-[220px] truncate text-xs text-zinc-600">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getKycClass(
                              user.kyc?.status
                            )}`}
                          >
                            {user.kyc?.status || "NOT SUBMITTED"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm font-medium">
                            {formatCurrency(
                              user.balance?.available || 0
                            )}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            Available
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-zinc-500">
                          {formatDate(user.createdAt)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-400"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-white/10 lg:hidden">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 font-semibold text-emerald-400">
                          {(
                            user.firstName ||
                            user.email ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {getFullName(user)}
                          </p>

                          <p className="mt-1 truncate text-xs text-zinc-600">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs text-zinc-600">
                          KYC
                        </p>

                        <p className="mt-2 text-sm">
                          {user.kyc?.status ||
                            "NOT SUBMITTED"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs text-zinc-600">
                          Available
                        </p>

                        <p className="mt-2 text-sm font-medium">
                          {formatCurrency(
                            user.balance?.available || 0
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="text-xs text-zinc-600">
                        Joined{" "}
                        {formatDate(user.createdAt)}
                      </p>

                      <Link
                        href={`/admin/users/${user.id}`}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-emerald-400/30 hover:text-emerald-400"
                      >
                        View user
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <p className="mt-8 text-center text-xs text-zinc-700">
          Edge Portfolio • Admin • Users
        </p>
      </div>
    </main>
  );
}