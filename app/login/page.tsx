"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Step = "login" | "otp";

export default function LoginPage() {
const router = useRouter();

const [step, setStep] = useState<Step>("login");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [code, setCode] = useState("");

const [loading, setLoading] = useState(false);
const [resending, setResending] = useState(false);
const [error, setError] = useState("");
const [message, setMessage] = useState("");

const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
event.preventDefault();

setError("");
setMessage("");
setLoading(true);

try {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    setError(data.message || "Unable to sign in.");
    return;
  }

  if (data.otpRequired) {
    setStep("otp");
    setMessage(
      "A verification code has been sent to your email."
    );
  }
} catch {
  setError(
    "Unable to connect to Edge Portfolio. Please try again."
  );
} finally {
  setLoading(false);
}

};

const handleVerifyOtp = async (
event: FormEvent<HTMLFormElement>
) => {
event.preventDefault();

setError("");
setMessage("");

if (!/^\d{6}$/.test(code)) {
  setError("Enter the 6-digit verification code.");
  return;
}

setLoading(true);

try {
  const response = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      code,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    setError(
      data.message || "Unable to verify the code."
    );
    return;
  }

  router.push(data.redirectTo || "/dashboard");
} catch {
  setError(
    "Unable to connect to Edge Portfolio. Please try again."
  );
} finally {
  setLoading(false);
}

};

const handleResendOtp = async () => {
setError("");
setMessage("");
setResending(true);

try {
  const response = await fetch("/api/auth/resend-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    setError(
      data.message || "Unable to resend the code."
    );
    return;
  }

  setCode("");
  setMessage(
    "A new verification code has been sent to your email."
  );
} catch {
  setError(
    "Unable to connect to Edge Portfolio. Please try again."
  );
} finally {
  setResending(false);
}

};

const handleBackToLogin = () => {
setStep("login");
setCode("");
setError("");
setMessage("");
};

return (
<main className="min-h-screen bg-[#050806] text-white">
<div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
<section className="relative hidden overflow-hidden border-r border-white/10 lg:flex">
<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.18),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.10),transparent_28%)]" />

      <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
              <span className="text-lg font-bold text-emerald-400">
                E
              </span>
            </div>

            <span className="text-xl font-semibold tracking-tight">
              Edge Portfolio
            </span>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.3em] text-emerald-400">
            Intelligent investing
          </p>

          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-7xl">
            Your portfolio.
            <br />
            Your edge.
          </h1>

          <p className="mt-7 max-w-lg text-base leading-7 text-zinc-400">
            Access your Edge Portfolio account and manage
            your investments across crypto, forex, and
            global markets from one secure platform.
          </p>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-zinc-500">
                Markets
              </p>
              <p className="mt-2 text-lg font-semibold">
                Global
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-zinc-500">
                Security
              </p>
              <p className="mt-2 text-lg font-semibold">
                2-Step
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-zinc-500">
                Access
              </p>
              <p className="mt-2 text-lg font-semibold">
                24/7
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-600">
          © {new Date().getFullYear()} Edge Portfolio
        </p>
      </div>
    </section>

    <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
      <div className="w-full max-w-md">
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
            <span className="text-lg font-bold text-emerald-400">
              E
            </span>
          </div>

          <span className="text-xl font-semibold">
            Edge Portfolio
          </span>
        </div>

        {step === "login" ? (
          <>
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-emerald-400">
                Secure access
              </p>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Sign in to continue to your Edge Portfolio
                account.
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  required
                  className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-400/10"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-emerald-400 transition hover:text-emerald-300"
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  required
                  className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-400/10"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-13 w-full items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-emerald-400 transition hover:text-emerald-300"
              >
                Create one
              </a>
            </p>
          </>
        ) : (
          <>
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-emerald-400">
                Two-step verification
              </p>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Check your email
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                We sent a 6-digit verification code to{" "}
                <span className="font-medium text-zinc-300">
                  {email}
                </span>
                .
              </p>
            </div>

            <form
              onSubmit={handleVerifyOtp}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Verification code
                </label>

                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(event) =>
                    setCode(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  placeholder="000000"
                  required
                  className="h-16 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-center text-2xl font-semibold tracking-[0.5em] text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-emerald-400/10"
                />
              </div>

              {message && (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-300">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="flex h-13 w-full items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify and continue"}
              </button>
            </form>

            <div className="mt-7 flex flex-col items-center gap-4 text-sm">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="font-medium text-emerald-400 transition hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resending
                  ? "Sending new code..."
                  : "Resend verification code"}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-zinc-500 transition hover:text-zinc-300"
              >
                ← Back to sign in
              </button>
            </div>
          </>
        )}

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-zinc-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Protected by secure authentication
        </div>
      </div>
    </section>
  </div>
</main>

);
}