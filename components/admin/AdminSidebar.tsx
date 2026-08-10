"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navigation = [
{
label: "Admin Dashboard",
href: "/admin",
icon: "⌂",
},
{
label: "Users",
href: "/admin/users",
icon: "◉",
},
{
label: "KYC",
href: "/admin/kyc",
icon: "✓",
},
{
label: "Deposit Settings",
href: "/admin/deposit-settings",
icon: "↓",
},
{
label: "Withdrawal Settings",
href: "/admin/withdrawal-settings",
icon: "↑",
},
{
label: "Transactions",
href: "/admin/transactions",
icon: "↔",
},
{
label: "Balance Management",
href: "/admin/balances",
icon: "$",
},
{
label: "Messages",
href: "/admin/messages",
icon: "✉",
},
{
label: "Settings",
href: "/admin/settings",
icon: "⚙",
},
];

export default function AdminSidebar() {
const pathname = usePathname();
const router = useRouter();

const [loggingOut, setLoggingOut] = useState(false);

function isActive(href: string) {
if (href === "/admin") {
return pathname === "/admin";
}


return pathname === href || pathname.startsWith(`${href}/`);


}

async function handleLogout() {
if (loggingOut) {
return;
}


try {
  setLoggingOut(true);

  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to log out.");
  }

  router.replace("/login");
  router.refresh();
} catch (error) {
  console.error("Admin logout error:", error);
  setLoggingOut(false);
  alert("Unable to log out. Please try again.");
}


}

return (
<>
{/* Desktop Sidebar */} <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/10 bg-[#080a09] lg:flex">
{/* Logo / Brand */} <div className="border-b border-white/10 px-6 py-5"> <Link href="/admin" className="flex items-center gap-3"> <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-sm font-bold text-black">
E </div>


        <div>
          <p className="font-semibold tracking-tight text-white">
            Edge Portfolio
          </p>

          <p className="mt-0.5 text-xs text-zinc-500">
            Administration
          </p>
        </div>
      </Link>
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto px-4 py-6">
      <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
        Administration
      </p>

      <div className="space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                active
                  ? "bg-emerald-500/10 font-medium text-emerald-400"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base transition ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-500 group-hover:text-zinc-300"
                }`}
              >
                {item.icon}
              </span>

              <span>{item.label}</span>

              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="group mt-3 flex w-full items-center gap-3 rounded-xl border-t border-white/10 px-4 py-4 pt-5 text-left text-sm text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-base text-red-400 transition group-hover:bg-red-500/15 group-hover:text-red-300">
            ↪
          </span>

          <span>{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </nav>

    {/* Bottom Account Area */}
    <div className="border-t border-white/10 p-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-400">
            A
          </div>

          <div className="min-w-0">
            <p className="text-xs text-zinc-600">
              Administrator
            </p>

            <p className="mt-0.5 truncate text-sm font-medium text-zinc-300">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      <Link
        href="/dashboard"
        className="mt-3 block rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-zinc-500 transition hover:bg-white/[0.04] hover:text-white"
      >
        User Dashboard
      </Link>
    </div>
  </aside>

  {/* Mobile Header */}
  <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#080a09]/95 backdrop-blur-xl lg:hidden">
    <div className="flex items-center justify-between px-4 py-3">
      <Link
        href="/admin"
        className="flex items-center gap-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-black">
          E
        </div>

        <div>
          <p className="text-sm font-semibold text-white">
            Edge Portfolio
          </p>

          <p className="text-[10px] text-zinc-600">
            Administration
          </p>
        </div>
      </Link>

      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-medium text-emerald-400">
        ADMIN
      </span>
    </div>

    {/* Mobile Navigation */}
    <div className="border-t border-white/5">
      <nav className="flex gap-1 overflow-x-auto px-3 py-2">
        {navigation.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
                active
                  ? "bg-emerald-500/10 font-medium text-emerald-400"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Mobile Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>↪</span>
          <span>{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </nav>
    </div>
  </div>
</>


);
}

