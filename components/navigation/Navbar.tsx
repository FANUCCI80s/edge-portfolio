
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-white/[0.06] bg-[#050806]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center"
          aria-label="Edge Portfolio home"
        >
          <Image
            src="/branding/edge-portfolio-logo.png"
            alt="Edge Portfolio"
            width={180}
            height={52}
            priority
            className="h-11 w-auto rounded-xl object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          <a
            href="#markets"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Markets
          </a>

          <a
            href="#why-edge"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Why Edge
          </a>

          <a
            href="#how-it-works"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            How It Works
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
          >
            Log In
          </Link>

          <Link
            href="/signup"
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-300 transition hover:bg-white/[0.05] lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className="text-xl">
            {mobileOpen ? "×" : "☰"}
          </span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-white/[0.06] bg-[#070908] px-6 py-5 lg:hidden">
          <nav className="flex flex-col gap-2">
            <a
              href="#markets"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Markets
            </a>

            <a
              href="#why-edge"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Why Edge
            </a>

            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              How It Works
            </a>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
              >
                Log In
              </Link>

              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

