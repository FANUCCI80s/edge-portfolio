"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DepositMethod =
| "BANK_TRANSFER"
| "CARD"
| "CRYPTOCURRENCY"
| "CASH_APP"
| "PAYPAL"
| "ZELLE"
| "VENMO";

type DepositConfig = {
bankAccount: {
id: string;
accountName: string;
bankName: string;
accountNumber: string;
routingNumber: string | null;
swiftBic: string | null;
bankAddress: string | null;
instructions: string | null;
} | null;

cryptoOptions: Array<{
id: string;
asset: string;
symbol: string;
network: string;
walletAddress: string;
instructions: string | null;
}>;

paymentConfigs: Array<{
id: string;
method: DepositMethod;
paymentInformation: string;
instructions: string | null;
}>;
};

const depositMethods: Array<{
value: DepositMethod;
label: string;
description: string;
}> = [
{
value: "BANK_TRANSFER",
label: "Bank Transfer",
description: "Transfer funds from your bank account.",
},
{
value: "CARD",
label: "Card",
description: "Use the card payment information provided.",
},
{
value: "CRYPTOCURRENCY",
label: "Cryptocurrency",
description: "Send cryptocurrency to the provided wallet.",
},
{
value: "CASH_APP",
label: "Cash App",
description: "Send your payment through Cash App.",
},
{
value: "PAYPAL",
label: "PayPal",
description: "Send your payment through PayPal.",
},
{
value: "ZELLE",
label: "Zelle",
description: "Send your payment through Zelle.",
},
{
value: "VENMO",
label: "Venmo",
description: "Send your payment through Venmo.",
},
];

function formatMethod(method: DepositMethod) {
return (
depositMethods.find((item) => item.value === method)?.label ??
method
);
}

export default function DepositPage() {
const [method, setMethod] =
useState<DepositMethod>("BANK_TRANSFER");

const [amount, setAmount] = useState("");
const [reference, setReference] = useState("");
const [notes, setNotes] = useState("");

const [config, setConfig] =
useState<DepositConfig | null>(null);

const [loadingConfig, setLoadingConfig] =
useState(true);

const [submitting, setSubmitting] =
useState(false);

const [message, setMessage] = useState("");
const [error, setError] = useState("");

useEffect(() => {
let cancelled = false;


async function loadDepositConfig() {
  try {
    setLoadingConfig(true);
    setError("");

    const response = await fetch("/api/deposit", {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          "Unable to load deposit instructions."
      );
    }

    if (!cancelled) {
      setConfig(data.config);
    }
  } catch (err) {
    if (!cancelled) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load deposit instructions."
      );
    }
  } finally {
    if (!cancelled) {
      setLoadingConfig(false);
    }
  }
}

loadDepositConfig();

return () => {
  cancelled = true;
};


}, []);

const selectedPaymentConfig = useMemo(() => {
if (!config) {
return null;
}


return (
  config.paymentConfigs.find(
    (item) => item.method === method
  ) ?? null
);


}, [config, method]);

const selectedCryptoOption = useMemo(() => {
if (!config || method !== "CRYPTOCURRENCY") {
return null;
}


return config.cryptoOptions[0] ?? null;


}, [config, method]);

async function handleSubmit(
event: React.FormEvent<HTMLFormElement>
) {
event.preventDefault();


setMessage("");
setError("");

const numericAmount = Number(amount);

if (
  !amount ||
  !Number.isFinite(numericAmount) ||
  numericAmount <= 0
) {
  setError("Please enter a valid deposit amount.");
  return;
}

if (numericAmount > 1000000000) {
  setError("The deposit amount is too large.");
  return;
}

try {
  setSubmitting(true);

  const response = await fetch("/api/deposit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method,
      amount,
      reference,
      note: notes,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Unable to submit deposit request."
    );
  }

  setMessage(
    data.message ||
      "Your deposit request has been submitted."
  );

  setAmount("");
  setReference("");
  setNotes("");
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to submit deposit request."
  );
} finally {
  setSubmitting(false);
}


}

return ( <main className="min-h-screen bg-[#050706] text-white"> <div className="flex min-h-screen">
{/* Sidebar */} <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#080a09] lg:flex lg:flex-col"> <div className="border-b border-white/10 p-5"> <Link
           href="/dashboard"
           className="flex items-center gap-3"
         > <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10"> <span className="font-bold text-emerald-400">
E </span> </div>


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
          className="flex items-center gap-3 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-400"
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

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-emerald-400">
            Fund your account
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Make a deposit
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Choose your preferred deposit method,
            follow the payment instructions, and
            submit your deposit for administrator
            approval.
          </p>
        </div>

        {/* Security notice */}
        <div className="mb-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400">
              !
            </div>

            <div>
              <p className="font-medium text-yellow-300">
                Important
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Only send funds using the payment
                information displayed on this page.
                Your deposit will remain pending until
                it has been reviewed and approved.
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loadingConfig && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />

              <p className="text-sm text-zinc-400">
                Loading available deposit methods...
              </p>
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

        {/* Success */}
        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                ✓
              </div>

              <div>
                <p className="font-medium text-emerald-300">
                  Deposit request submitted
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

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Step 1 */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-sm text-zinc-500">
              Step 1
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Choose deposit method
            </h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {depositMethods.map(
                (depositMethod) => {
                  const selected =
                    method === depositMethod.value;

                  return (
                    <button
                      key={depositMethod.value}
                      type="button"
                      onClick={() =>
                        setMethod(
                          depositMethod.value
                        )
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
                            {depositMethod.label}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-zinc-600">
                            {
                              depositMethod.description
                            }
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
                }
              )}
            </div>
          </section>

          {/* Step 2 */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-sm text-zinc-500">
              Step 2
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              {formatMethod(method)} instructions
            </h2>

            {!config ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-6">
                <p className="text-sm text-zinc-500">
                  Deposit instructions are currently
                  unavailable.
                </p>
              </div>
            ) : method === "BANK_TRANSFER" ? (
              config.bankAccount ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-5">
                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                      Bank name
                    </p>

                    <p className="mt-1 font-medium text-white">
                      {config.bankAccount.bankName}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-xs text-zinc-600">
                        Account name
                      </p>

                      <p className="mt-1 break-words text-sm font-medium">
                        {
                          config.bankAccount
                            .accountName
                        }
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-xs text-zinc-600">
                        Account number
                      </p>

                      <p className="mt-1 break-all text-sm font-medium">
                        {
                          config.bankAccount
                            .accountNumber
                        }
                      </p>
                    </div>

                    {config.bankAccount
                      .routingNumber && (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                        <p className="text-xs text-zinc-600">
                          Routing number
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {
                            config.bankAccount
                              .routingNumber
                          }
                        </p>
                      </div>
                    )}

                    {config.bankAccount
                      .swiftBic && (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                        <p className="text-xs text-zinc-600">
                          SWIFT / BIC
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {
                            config.bankAccount
                              .swiftBic
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  {config.bankAccount
                    .bankAddress && (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-xs text-zinc-600">
                        Bank address
                      </p>

                      <p className="mt-1 text-sm leading-6 text-zinc-300">
                        {
                          config.bankAccount
                            .bankAddress
                        }
                      </p>
                    </div>
                  )}

                  {config.bankAccount
                    .instructions && (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-xs text-zinc-600">
                        Instructions
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                        {
                          config.bankAccount
                            .instructions
                        }
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-6">
                  <p className="text-sm text-zinc-500">
                    Bank transfer deposits are
                    currently unavailable.
                  </p>
                </div>
              )
            ) : method === "CRYPTOCURRENCY" ? (
              selectedCryptoOption ? (
                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-xs text-zinc-600">
                        Asset
                      </p>

                      <p className="mt-1 font-medium">
                        {selectedCryptoOption.asset}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-xs text-zinc-600">
                        Symbol
                      </p>

                      <p className="mt-1 font-medium">
                        {selectedCryptoOption.symbol}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-xs text-zinc-600">
                        Network
                      </p>

                      <p className="mt-1 font-medium">
                        {selectedCryptoOption.network}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                    <p className="text-xs text-zinc-600">
                      Wallet address
                    </p>

                    <p className="mt-2 break-all font-mono text-sm leading-6 text-emerald-300">
                      {
                        selectedCryptoOption.walletAddress
                      }
                    </p>
                  </div>

                  {selectedCryptoOption
                    .instructions && (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-xs text-zinc-600">
                        Instructions
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                        {
                          selectedCryptoOption.instructions
                        }
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-6">
                  <p className="text-sm text-zinc-500">
                    Cryptocurrency deposits are
                    currently unavailable.
                  </p>
                </div>
              )
            ) : selectedPaymentConfig ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                  <p className="text-xs uppercase tracking-wider text-zinc-600">
                    {formatMethod(method)} payment
                    information
                  </p>

                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-emerald-300">
                    {
                      selectedPaymentConfig.paymentInformation
                    }
                  </p>
                </div>

                {selectedPaymentConfig
                  .instructions && (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-xs text-zinc-600">
                      Instructions
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                      {
                        selectedPaymentConfig.instructions
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-6">
                <p className="text-sm text-zinc-500">
                  {formatMethod(method)} deposits
                  are currently unavailable.
                </p>
              </div>
            )}
          </section>

          {/* Step 3 */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-sm text-zinc-500">
              Step 3
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Submit deposit details
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Deposit amount
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

              <div>
                <label
                  htmlFor="reference"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Transaction reference
                </label>

                <input
                  id="reference"
                  name="reference"
                  type="text"
                  value={reference}
                  onChange={(event) =>
                    setReference(event.target.value)
                  }
                  placeholder="Optional transaction ID"
                  maxLength={200}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Additional details
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  maxLength={2000}
                  placeholder="Add any information that may help us identify your deposit."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                />
              </div>
            </div>
          </section>

          {/* Approval notice */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-zinc-400">
                i
              </div>

              <div>
                <p className="text-sm font-medium">
                  Administrator approval required
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Submitting this form creates a
                  pending deposit request. Your
                  account balance will not change
                  until an administrator reviews and
                  approves the request.
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
              disabled={
                submitting || loadingConfig
              }
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit deposit request"}
            </button>
          </div>
        </form>
      </div>
    </section>
  </div>
</main>


);
}
