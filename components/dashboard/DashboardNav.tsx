
"use client";

import Link from "next/link";
import { useState } from "react";

export default function DashboardNav() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-[#080a09] lg:flex">
        {/* Logo */}
        <div className="border-b border-white/10 p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
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

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-400"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            href="/market-watchlist"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <span>↗</span>
            Market Watchlist
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

        {/* Bottom */}
        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs text-zinc-600">
              Signed in
            </p>

            <Link
              href="/settings"
              className="mt-1 block text-sm font-medium text-zinc-300 hover:text-white"
            >
              Account settings
            </Link>
          </div>

          <button
            type="button"
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-red-400/10 hover:text-red-400"
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile / Tablet Menu Button */}
      <div className="absolute right-5 top-5 z-30 sm:right-8 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#080a09] text-zinc-300 shadow-lg transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-400"
        >
          <span className="text-xl leading-none">
            ☰
          </span>
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Mobile / Tablet Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-white/10 bg-[#080a09] shadow-2xl transition-transform duration-300 lg:hidden ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <Link
            href="/dashboard"
            onClick={closeMenu}
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

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <Link
            href="/dashboard"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-400"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            href="/market-watchlist"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <span>↗</span>
            Market Watchlist
          </Link>

          <Link
            href="/deposit"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <span>↓</span>
            Deposit
          </Link>

          <Link
            href="/withdraw"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <span>↑</span>
            Withdraw
          </Link>

          <Link
            href="/transactions"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <span>↔</span>
            Transactions
          </Link>

          <div className="my-5 border-t border-white/10" />

          <Link
            href="/notifications"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <span>●</span>
            Notifications
          </Link>

          <Link
            href="/settings"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <span>⚙</span>
            Settings
          </Link>
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={closeMenu}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-red-400/10 hover:text-red-400"
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

