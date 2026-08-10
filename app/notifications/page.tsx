
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  type: "ADMIN" | "ACCOUNT";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load notifications."
          );
        }

        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Notifications loading error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load notifications."
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  async function markAsRead(notificationId: string) {
    const currentNotification = notifications.find(
      (notification) => notification.id === notificationId
    );

    if (!currentNotification || currentNotification.read) {
      return;
    }

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to mark notification as read."
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
    } catch (error) {
      console.error("Mark notification as read error:", error);
    }
  }

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <main className="min-h-screen bg-[#080a09] text-white">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <span>←</span>
            Back to dashboard
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-400">
                Account updates
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Notifications
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                View important messages and account alerts from
                Edge Portfolio.
              </p>
            </div>

            {unreadCount > 0 && (
              <div className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                {unreadCount} unread
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-5 py-5 sm:px-6">
            <p className="text-sm font-medium">
              Your notifications
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Admin messages and important account alerts appear
              here.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

              <p className="mt-4 text-sm text-zinc-500">
                Loading notifications...
              </p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-400/10 text-red-400">
                !
              </div>

              <h2 className="mt-4 font-medium">
                Unable to load notifications
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center sm:p-14">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05] text-zinc-500">
                ●
              </div>

              <h2 className="mt-5 font-medium">
                No notifications
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                You don't have any account messages or alerts at
                the moment.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markAsRead(notification.id)}
                  className={`block w-full text-left transition hover:bg-white/[0.03] ${
                    notification.read
                      ? "bg-transparent"
                      : "bg-emerald-400/[0.025]"
                  }`}
                >
                  <div className="flex gap-4 px-5 py-5 sm:px-6">
                    {/* Status indicator */}
                    <div className="pt-1.5">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          notification.read
                            ? "bg-zinc-700"
                            : "bg-emerald-400"
                        }`}
                      />
                    </div>

                    {/* Notification content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-2">
                          <h2
                            className={`text-sm font-semibold ${
                              notification.read
                                ? "text-zinc-300"
                                : "text-white"
                            }`}
                          >
                            {notification.title}
                          </h2>

                          {!notification.read && (
                            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-400">
                              New
                            </span>
                          )}
                        </div>

                        <span className="shrink-0 text-xs text-zinc-600">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {notification.message}
                      </p>

                      {!notification.read && (
                        <p className="mt-3 text-xs font-medium text-emerald-400">
                          Click to mark as read
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

