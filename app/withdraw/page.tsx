
"use client";

import Link from "next/link";
import { useState } from "react";

type WithdrawalMethod =
  | "BANK_TRANSFER"
  | "CASH_APP"
  | "PAYPAL"
  | "ZELLE"
  | "VENMO";

const withdrawalMethods: Array<{
  value: WithdrawalMethod;
  label: string;
  description: string;
}> = [
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    description: "Withdraw funds directly to your bank account.",
  },
  {
    value: "CASH_APP",
    label: "Cash App",
    description: "Receive your withdrawal through Cash App.",
  },
  {
    value: "PAYPAL",
    label: "PayPal",
    description: "Receive your withdrawal through PayPal.",
  },
  {
    value: "ZELLE",
    label: "Zelle",
    description: "Receive your withdrawal through Zelle.",
  },
  {
    value: "VENMO",
    label: "Venmo",
    description: "Receive your withdrawal through Venmo.",
  },
];

function formatMethod(method: WithdrawalMethod) {
  return (
    withdrawalMethods.find((item) => item.value === method)?.label ??
    method
  );
}

export default function WithdrawPage() {
  const [method, setMethod] =
    useState<WithdrawalMethod>("BANK_TRANSFER");

  const [amount, setAmount] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tag, setTag] = useState("");

  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [swiftBic, setSwiftBic] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAddress, setBankAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function resetMessages() {
    setMessage("");
    setError("");
  }

  function handleMethodChange(value: WithdrawalMethod) {
    resetMessages();
    setMethod(value);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    resetMessages();

    const numericAmount = Number(amount);

    if (
      !amount ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }

    if (numericAmount > 1000000000) {
      setError("The withdrawal amount is too large.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (method === "BANK_TRANSFER") {
      if (
        !bankAccountName.trim() ||
        !bankAccountNumber.trim() ||
        !bankName.trim()
      ) {
        setError(
          "Please provide your bank account name, account number, and bank name."
        );
        return;
      }
    }

    if (method === "CASH_APP" && !tag.trim()) {
      setError("Please enter your Cash App information.");
      return;
    }

    if (method === "PAYPAL" && !email.trim()) {
      setError("Please enter your PayPal email address.");
      return;
    }

    if (method === "ZELLE" && !email.trim() && !phone.trim()) {
      setError("Please provide your Zelle email or phone number.");
      return;
    }

    if (method === "VENMO" && !tag.trim()) {
      setError("Please enter your Venmo username.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method,
          amount,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          tag: tag.trim(),

          bankAccountName: bankAccountName.trim(),
          bankAccountNumber: bankAccountNumber.trim(),
          routingNumber: routingNumber.trim(),
          swiftBic: swiftBic.trim(),
          bankName: bankName.trim(),
          bankAddress: bankAddress.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to submit withdrawal request."
        );
      }

      setMessage(
        data.message ||
          "Your withdrawal request has been submitted successfully."
      );

      setAmount("");
      setName("");
      setEmail("");
      setPhone("");
      setTag("");

      setBankAccountName("");
      setBankAccountNumber("");
      setRoutingNumber("");
      setSwiftBic("");
      setBankName("");
      setBankAddress("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit withdrawal request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050706] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#080a09] lg:flex lg:flex-col">
          <div className="border-b border-white/10 p-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
                <span className="font-bold text-emerald-400">E</span>
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
              className="flex items-center gap-3 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-400"
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
                  <span className="font-bold text-emerald-400">E</span>
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

          <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
            {/* Header */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-emerald-400">
                Withdraw funds
              </p>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Request a withdrawal
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Choose your preferred withdrawal method, provide your
                payment details, and submit your request for administrator
                approval.
              </p>
            </div>

            {/* Important notice */}
            <div className="mb-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400">
                  !
                </div>

                <div>
                  <p className="font-medium text-yellow-300">
                    Administrator approval required
                  </p>

                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    All withdrawal requests are reviewed by an administrator
                    before processing. Your withdrawal will remain pending
                    until it has been reviewed.
                  </p>
                </div>
              </div>
            </div>

            {/* Success */}
            {message && (
              <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                    ✓
                  </div>

                  <div>
                    <p className="font-medium text-emerald-300">
                      Withdrawal request submitted
                    </p>

                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                      {message}
                    </p>

                    <Link
                      href="/transactions"
                      className="mt-3 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      View transactions →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                <p className="text-sm font-medium text-red-300">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1 */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                <p className="text-sm text-zinc-500">Step 1</p>

                <h2 className="mt-1 text-xl font-semibold">
                  Choose withdrawal method
                </h2>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {withdrawalMethods.map((withdrawalMethod) => {
                    const selected =
                      method === withdrawalMethod.value;

                    return (
                      <button
                        key={withdrawalMethod.value}
                        type="button"
                        onClick={() =>
                          handleMethodChange(withdrawalMethod.value)
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-emerald-400/40 bg-emerald-400/10"
                            : "border-white/10 bg-black/20 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p
                              className={`font-medium ${
                                selected
                                  ? "text-emerald-300"
                                  : "text-white"
                              }`}
                            >
                              {withdrawalMethod.label}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                              {withdrawalMethod.description}
                            </p>
                          </div>

                          <div
                            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-emerald-400 bg-emerald-400 text-black"
                                : "border-white/20"
                            }`}
                          >
                            {selected && (
                              <span className="text-xs font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Step 2 */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                <p className="text-sm text-zinc-500">Step 2</p>

                <h2 className="mt-1 text-xl font-semibold">
                  Withdrawal details
                </h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {/* Amount */}
                  <div>
                    <label
                      htmlFor="amount"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      Withdrawal amount
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                        $
                      </span>

                      <input
                        id="amount"
                        name="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(event) =>
                          setAmount(event.target.value)
                        }
                        required
                        placeholder="0.00"
                        className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      Full name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      required
                      placeholder="Name on receiving account"
                      maxLength={200}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="recipient@example.com"
                      maxLength={200}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      Phone number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      placeholder="+1 555 000 0000"
                      maxLength={50}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                    />
                  </div>
                </div>
              </section>

              {/* Step 3 */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                <p className="text-sm text-zinc-500">Step 3</p>

                <h2 className="mt-1 text-xl font-semibold">
                  {formatMethod(method)} information
                </h2>

                {method === "BANK_TRANSFER" && (
                  <div className="mt-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="bankAccountName"
                          className="mb-2 block text-sm font-medium text-zinc-300"
                        >
                          Account name
                        </label>

                        <input
                          id="bankAccountName"
                          value={bankAccountName}
                          onChange={(event) =>
                            setBankAccountName(event.target.value)
                          }
                          required
                          placeholder="Account holder name"
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="bankName"
                          className="mb-2 block text-sm font-medium text-zinc-300"
                        >
                          Bank name
                        </label>

                        <input
                          id="bankName"
                          value={bankName}
                          onChange={(event) =>
                            setBankName(event.target.value)
                          }
                          required
                          placeholder="Your bank name"
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="bankAccountNumber"
                          className="mb-2 block text-sm font-medium text-zinc-300"
                        >
                          Account number
                        </label>

                        <input
                          id="bankAccountNumber"
                          value={bankAccountNumber}
                          onChange={(event) =>
                            setBankAccountNumber(event.target.value)
                          }
                          required
                          placeholder="Bank account number"
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="routingNumber"
                          className="mb-2 block text-sm font-medium text-zinc-300"
                        >
                          Routing number
                        </label>

                        <input
                          id="routingNumber"
                          value={routingNumber}
                          onChange={(event) =>
                            setRoutingNumber(event.target.value)
                          }
                          placeholder="Optional"
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="swiftBic"
                          className="mb-2 block text-sm font-medium text-zinc-300"
                        >
                          SWIFT / BIC
                        </label>

                        <input
                          id="swiftBic"
                          value={swiftBic}
                          onChange={(event) =>
                            setSwiftBic(event.target.value)
                          }
                          placeholder="Optional"
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="bankAddress"
                          className="mb-2 block text-sm font-medium text-zinc-300"
                        >
                          Bank address
                        </label>

                        <input
                          id="bankAddress"
                          value={bankAddress}
                          onChange={(event) =>
                            setBankAddress(event.target.value)
                          }
                          placeholder="Optional"
                          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {method === "CASH_APP" && (
                  <div className="mt-6">
                    <label
                      htmlFor="cashApp"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      Cash App username
                    </label>

                    <input
                      id="cashApp"
                      value={tag}
                      onChange={(event) =>
                        setTag(event.target.value)
                      }
                      required
                      placeholder="$YourCashTag"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                    />
                  </div>
                )}

                {method === "PAYPAL" && (
                  <div className="mt-6">
                    <label
                      htmlFor="paypalEmail"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      PayPal email
                    </label>

                    <input
                      id="paypalEmail"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      required
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                    />
                  </div>
                )}

                {method === "ZELLE" && (
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="zelleEmail"
                        className="mb-2 block text-sm font-medium text-zinc-300"
                      >
                        Zelle email
                      </label>

                      <input
                        id="zelleEmail"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="your@email.com"
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="zellePhone"
                        className="mb-2 block text-sm font-medium text-zinc-300"
                      >
                        Zelle phone
                      </label>

                      <input
                        id="zellePhone"
                        type="tel"
                        value={phone}
                        onChange={(event) =>
                          setPhone(event.target.value)
                        }
                        placeholder="+1 555 000 0000"
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                      />
                    </div>
                  </div>
                )}

                {method === "VENMO" && (
                  <div className="mt-6">
                    <label
                      htmlFor="venmo"
                      className="mb-2 block text-sm font-medium text-zinc-300"
                    >
                      Venmo username
                    </label>

                    <input
                      id="venmo"
                      value={tag}
                      onChange={(event) =>
                        setTag(event.target.value)
                      }
                      required
                      placeholder="@YourVenmoUsername"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                    />
                  </div>
                )}
              </section>

              {/* Approval notice */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-zinc-400">
                    i
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Your withdrawal will be reviewed
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                      Your request will initially be marked as Pending.
                      An administrator must approve it before the withdrawal
                      can be processed. If declined, the request will be
                      marked Declined and your funds will remain available.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-white/10 px-6 py-3 text-center text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:text-white"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit withdrawal request"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

