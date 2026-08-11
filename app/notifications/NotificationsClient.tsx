
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "SECURITY"
  | "TRANSACTION"
  | "KYC"
  | "TRADE"
  | "SYSTEM";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
};

type FilterType = "ALL" | "UNREAD" | "READ";

const filters: Array<{
  value: FilterType;
  label: string;
}> = [
  {
    value: "ALL",
    label: "All",
  },
  {
    value: "UNREAD",
    label: "Unread",
  },
  {
    value: "READ",
    label: "Read",
  },
];

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "SUCCESS":
      return "✓";

    case "WARNING":
      return "!";

    case "ERROR":
      return "×";

    case "SECURITY":
      return "◆";

    case "TRANSACTION":
      return "$";

    case "KYC":
      return "✓";

    case "TRADE":
      return "↗";

    case "SYSTEM":
      return "⚙";

    case "INFO":
    default:
      return "i";
  }
}

function getNotificationIconClass(type: NotificationType) {
  switch (type) {
    case "SUCCESS":
    case "KYC":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";

    case "WARNING":
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";

    case "ERROR":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    case "SECURITY":
      return "border-purple-400/20 bg-purple-400/10 text-purple-300";

    case "TRANSACTION":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "TRADE":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

    case "SYSTEM":
      return "border-zinc-400/20 bg-zinc-400/10 text-zinc-300";

    case "INFO":
    default:
      return "border-white/10 bg-white/[0.04] text-zinc-400";
  }
}

function getNotificationTypeLabel(type: NotificationType) {
  switch (type) {
    case "SUCCESS":
      return "Success";

    case "WARNING":
      return "Warning";

    case "ERROR":
      return "Alert";

    case "SECURITY":
      return "Security";

    case "TRANSACTION":
      return "Transaction";

    case "KYC":
      return "KYC";

    case "TRADE":
      return "Trade";

    case "SYSTEM":
      return "System";

    case "INFO":
    default:
      return "Information";
  }
}

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/notifications", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load notifications."
        );
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      setMarkingId(notificationId);

      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId,
          read: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update notification."
        );
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update notification."
      );
    } finally {
      setMarkingId(null);
    }
  }

  async function markAllAsRead() {
    try {
      setMarkingAll(true);
      setError("");

      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markAllAsRead: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to mark notifications as read."
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) => !notification.read
    ).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter(
        (notification) => !notification.read
      );
    }

    if (filter === "READ") {
      return notifications.filter(
        (notification) => notification.read
      );
    }

    return notifications;
  }, [notifications, filter]);

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
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>↔</span>
              Transactions
            </Link>

            <div className="my-5 border-t border-white/10" />

            <Link
              href="/notifications"
              className="flex items-center justify-between rounded-xl bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-400"
            >
              <span className="flex items-center gap-3">
                <span>●</span>
                Notifications
              </span>

              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1.5 text-[10px] font-bold text-black">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
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
            <div className="flex items-center justify-between gap-4">
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
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-sm font-medium text-emerald-400">
                    Account activity
                  </p>

                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Notifications
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                    Stay up to date with account activity,
                    transactions, security alerts, KYC updates,
                    and trading activity.
                  </p>
                </div>

                {unreadCount > 0 && (
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
                    <p className="text-xs text-zinc-500">
                      Unread notifications
                    </p>

                    <p className="mt-1 text-xl font-semibold text-emerald-400">
                      {unreadCount}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-red-300">
                      Unable to update notifications
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:border-white/20 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Filters and actions */}
            <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-1 overflow-x-auto">
                  {filters.map((item) => {
                    const selected =
                      filter === item.value;

                    const count =
                      item.value === "ALL"
                        ? notifications.length
                        : item.value === "UNREAD"
                          ? unreadCount
                          : notifications.length -
                            unreadCount;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setFilter(item.value)
                        }
                        className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition ${
                          selected
                            ? "bg-emerald-400/10 font-medium text-emerald-400"
                            : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        {item.label}

                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                            selected
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-white/[0.04] text-zinc-600"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex shrink-0 gap-2 px-1 pb-1 sm:px-0 sm:pb-0">
                  <button
                    type="button"
                    onClick={loadNotifications}
                    disabled={loading}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Refresh
                  </button>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      disabled={markingAll}
                      className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {markingAll
                        ? "Marking..."
                        : "Mark all read"}
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Notification list */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              <div className="border-b border-white/10 px-6 py-5 sm:px-8">
                <div>
                  <h2 className="font-semibold">
                    Notification center
                  </h2>

                  <p className="mt-1 text-xs text-zinc-600">
                    {loading
                      ? "Loading..."
                      : `${filteredNotifications.length} notification${
                          filteredNotifications.length === 1
                            ? ""
                            : "s"
                        }`}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="px-6 py-16 text-center sm:px-8">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

                  <p className="mt-4 text-sm text-zinc-500">
                    Loading notifications...
                  </p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="px-6 py-16 text-center sm:px-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-lg text-zinc-500">
                    ●
                  </div>

                  <h3 className="mt-5 font-medium">
                    {filter === "UNREAD"
                      ? "You're all caught up"
                      : "No notifications found"}
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                    {filter === "UNREAD"
                      ? "You have no unread notifications at the moment."
                      : "Notifications about your Edge Portfolio account will appear here."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {filteredNotifications.map(
                    (notification) => (
                      <div
                        key={notification.id}
                        className={`p-5 transition sm:px-8 sm:py-6 ${
                          notification.read
                            ? "bg-transparent"
                            : "bg-emerald-400/[0.02]"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold ${getNotificationIconClass(
                              notification.type
                            )}`}
                          >
                            {getNotificationIcon(
                              notification.type
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-medium text-white">
                                    {notification.title}
                                  </h3>

                                  {!notification.read && (
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                  )}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                                    {getNotificationTypeLabel(
                                      notification.type
                                    )}
                                  </span>

                                  <span className="text-zinc-700">
                                    •
                                  </span>

                                  <span className="text-xs text-zinc-600">
                                    {formatDate(
                                      notification.createdAt
                                    )}
                                  </span>
                                </div>
                              </div>

                              {!notification.read && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    markAsRead(
                                      notification.id
                                    )
                                  }
                                  disabled={
                                    markingId ===
                                    notification.id
                                  }
                                  className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:border-emerald-400/30 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {markingId ===
                                  notification.id
                                    ? "Updating..."
                                    : "Mark as read"}
                                </button>
                              )}
                            </div>

                            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

