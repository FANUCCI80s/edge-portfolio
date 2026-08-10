
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DepositMethod =
  | "BANK_TRANSFER"
  | "CARD"
  | "CRYPTOCURRENCY"
  | "CASH_APP"
  | "PAYPAL"
  | "ZELLE"
  | "VENMO";

type BankAccount = {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string | null;
  swiftBic: string | null;
  bankAddress: string | null;
  instructions: string | null;
};

type CardConfig = {
  id: string;
  paymentLink: string;
  instructions: string | null;
};

type CryptoOption = {
  id: string;
  asset: string;
  symbol: string;
  network: string;
  walletAddress: string;
  instructions: string | null;
};

type PaymentConfig = {
  id: string;
  method: DepositMethod;
  paymentInformation: string;
  instructions: string | null;
};

type DepositConfig = {
  bankTransfer: BankAccount[];
  card: CardConfig[];
  cryptocurrency: CryptoOption[];
  payment: PaymentConfig[];
};

const METHOD_LABELS: Record<DepositMethod, string> = {
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
  CRYPTOCURRENCY: "Cryptocurrency",
  CASH_APP: "Cash App",
  PAYPAL: "PayPal",
  ZELLE: "Zelle",
  VENMO: "Venmo",
};

export default function DepositForm() {
  const [config, setConfig] = useState<DepositConfig>({
    bankTransfer: [],
    card: [],
    cryptocurrency: [],
    payment: [],
  });

  const [method, setMethod] =
    useState<DepositMethod | "">("");

  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDepositMethods() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/deposit", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load deposit methods."
          );
        }

        if (!cancelled) {
          setConfig({
            bankTransfer:
              data.methods?.bankTransfer ?? [],
            card: data.methods?.card ?? [],
            cryptocurrency:
              data.methods?.cryptocurrency ?? [],
            payment: data.methods?.payment ?? [],
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load deposit methods."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDepositMethods();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableMethods = useMemo(() => {
    const methods: DepositMethod[] = [];

    if (config.bankTransfer.length > 0) {
      methods.push("BANK_TRANSFER");
    }

    if (config.card.length > 0) {
      methods.push("CARD");
    }

    if (config.cryptocurrency.length > 0) {
      methods.push("CRYPTOCURRENCY");
    }

    const paymentMethods = config.payment
      .filter((item) => item.method)
      .map((item) => item.method);

    for (const paymentMethod of paymentMethods) {
      if (!methods.includes(paymentMethod)) {
        methods.push(paymentMethod);
      }
    }

    return methods;
  }, [config]);

  const selectedBank =
    method === "BANK_TRANSFER"
      ? config.bankTransfer[0] ?? null
      : null;

  const selectedCard =
    method === "CARD"
      ? config.card[0] ?? null
      : null;

  const selectedCrypto =
    method === "CRYPTOCURRENCY"
      ? config.cryptocurrency[0] ?? null
      : null;

  const selectedPayment =
    method !== "" &&
    method !== "BANK_TRANSFER" &&
    method !== "CARD" &&
    method !== "CRYPTOCURRENCY"
      ? config.payment.find(
          (item) => item.method === method
        ) ?? null
      : null;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!method) {
      setError("Please select a deposit method.");
      return;
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError("Please enter a valid deposit amount.");
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
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to submit your deposit request."
        );
      }

      setSuccess(
        "Your deposit request has been submitted successfully. It is now pending administrator review."
      );

      setAmount("");
      setReference("");
      setNotes("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your deposit request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Messages */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              !
            </div>

            <div>
              <p className="font-medium text-red-300">
                Deposit request error
              </p>

              <p className="mt-1 text-sm leading-6 text-red-200/60">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
              ✓
            </div>

            <div>
              <p className="font-medium text-emerald-300">
                Deposit request submitted
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-200/60">
                {success}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 1 */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-sm text-zinc-500">
          Step 1
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Deposit details
        </h2>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/20 p-6">
            <p className="text-sm text-zinc-500">
              Loading available deposit methods...
            </p>
          </div>
        ) : availableMethods.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6">
            <p className="font-medium text-yellow-300">
              No deposit methods are currently available.
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Please contact the administrator or try
              again later.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {/* Method */}
            <div className="sm:col-span-2">
              <label
                htmlFor="method"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Deposit method
              </label>

              <select
                id="method"
                value={method}
                onChange={(event) =>
                  setMethod(
                    event.target.value as
                      | DepositMethod
                      | ""
                  )
                }
                required
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/50"
              >
                <option
                  value=""
                  disabled
                  className="bg-zinc-900"
                >
                  Select a deposit method
                </option>

                {availableMethods.map(
                  (availableMethod) => (
                    <option
                      key={availableMethod}
                      value={availableMethod}
                      className="bg-zinc-900"
                    >
                      {METHOD_LABELS[availableMethod]}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Amount
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  $
                </span>

                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
                />
              </div>
            </div>

            {/* Reference */}
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
                placeholder="Optional reference"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
              />
            </div>

            {/* Notes */}
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
                placeholder="Add any information that may help us identify your deposit."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Step 2 */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-sm text-zinc-500">
          Step 2
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Payment instructions
        </h2>

        <div className="mt-6">
          {!method && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6">
              <p className="text-sm text-zinc-500">
                Select a deposit method to view the
                payment instructions.
              </p>
            </div>
          )}

          {method === "BANK_TRANSFER" &&
            selectedBank && (
              <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-6">
                <p className="font-medium text-emerald-300">
                  Bank transfer details
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Bank name"
                    value={selectedBank.bankName}
                  />

                  <InfoItem
                    label="Account name"
                    value={selectedBank.accountName}
                  />

                  <InfoItem
                    label="Account number"
                    value={selectedBank.accountNumber}
                    copyable
                  />

                  {selectedBank.routingNumber && (
                    <InfoItem
                      label="Routing number"
                      value={selectedBank.routingNumber}
                      copyable
                    />
                  )}

                  {selectedBank.swiftBic && (
                    <InfoItem
                      label="SWIFT / BIC"
                      value={selectedBank.swiftBic}
                      copyable
                    />
                  )}

                  {selectedBank.bankAddress && (
                    <InfoItem
                      label="Bank address"
                      value={selectedBank.bankAddress}
                    />
                  )}
                </div>

                {selectedBank.instructions && (
                  <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                      Instructions
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                      {selectedBank.instructions}
                    </p>
                  </div>
                )}
              </div>
            )}

          {method === "CARD" &&
            selectedCard && (
              <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-6">
                <p className="font-medium text-emerald-300">
                  Card payment
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Use the secure payment link provided
                  below to complete your card payment.
                </p>

                <a
                  href={selectedCard.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                >
                  Open secure payment page
                </a>

                {selectedCard.instructions && (
                  <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                      Instructions
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                      {selectedCard.instructions}
                    </p>
                  </div>
                )}
              </div>
            )}

          {method === "CRYPTOCURRENCY" &&
            selectedCrypto && (
              <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-6">
                <p className="font-medium text-emerald-300">
                  Cryptocurrency payment
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Asset"
                    value={selectedCrypto.asset}
                  />

                  <InfoItem
                    label="Symbol"
                    value={selectedCrypto.symbol}
                  />

                  <InfoItem
                    label="Network"
                    value={selectedCrypto.network}
                  />

                  <div className="sm:col-span-2">
                    <InfoItem
                      label="Wallet address"
                      value={
                        selectedCrypto.walletAddress
                      }
                      copyable
                    />
                  </div>
                </div>

                {selectedCrypto.instructions && (
                  <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                      Instructions
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                      {selectedCrypto.instructions}
                    </p>
                  </div>
                )}
              </div>
            )}

          {selectedPayment && (
            <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-6">
              <p className="font-medium text-emerald-300">
                {METHOD_LABELS[selectedPayment.method]} payment
              </p>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                  Payment information
                </p>

                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                  {selectedPayment.paymentInformation}
                </p>
              </div>

              {selectedPayment.instructions && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                    Instructions
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                    {selectedPayment.instructions}
                  </p>
                </div>
              )}
            </div>
          )}

          {method === "BANK_TRANSFER" &&
            !selectedBank && (
              <UnavailableMessage />
            )}

          {method === "CARD" &&
            !selectedCard && (
              <UnavailableMessage />
            )}

          {method === "CRYPTOCURRENCY" &&
            !selectedCrypto && (
              <UnavailableMessage />
            )}

          {method !== "" &&
            method !== "BANK_TRANSFER" &&
            method !== "CARD" &&
            method !== "CRYPTOCURRENCY" &&
            !selectedPayment && (
              <UnavailableMessage />
            )}
        </div>
      </div>

      {/* Submit */}
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
            loading ||
            submitting ||
            availableMethods.length === 0
          }
          className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : "Submit deposit request"}
        </button>
      </div>
    </form>
  );
}

function InfoItem({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access may be unavailable in some browsers.
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
        {label}
      </p>

      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="min-w-0 break-words text-sm text-zinc-300">
          {value}
        </p>

        {copyable && (
          <button
            type="button"
            onClick={copyValue}
            className="shrink-0 text-xs text-emerald-400 transition hover:text-emerald-300"
          >
            Copy
          </button>
        )}
      </div>
    </div>
  );
}

function UnavailableMessage() {
  return (
    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6">
      <p className="font-medium text-yellow-300">
        Payment information unavailable
      </p>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        This deposit method is currently unavailable.
        Please contact the administrator.
      </p>
    </div>
  );
}

