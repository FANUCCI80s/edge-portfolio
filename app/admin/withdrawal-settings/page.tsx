"use client";

import { useEffect, useState } from "react";

type WithdrawalMethod =
  | "BANK_TRANSFER"
  | "CASH_APP"
  | "PAYPAL"
  | "ZELLE"
  | "VENMO";

type WithdrawalConfig = {
  id: string;
  method: WithdrawalMethod;
  displayName: string;
  instructions: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  success: boolean;
  configs?: WithdrawalConfig[];
  config?: WithdrawalConfig;
  message?: string;
};

const methods: {
  value: WithdrawalMethod;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    description:
      "Provide the bank details and withdrawal instructions users should follow.",
    icon: "🏦",
  },
  {
    value: "CASH_APP",
    label: "Cash App",
    description:
      "Configure the Cash App account information used for withdrawals.",
    icon: "$",
  },
  {
    value: "PAYPAL",
    label: "PayPal",
    description:
      "Configure the PayPal account information used for withdrawals.",
    icon: "P",
  },
  {
    value: "ZELLE",
    label: "Zelle",
    description:
      "Configure the Zelle account information used for withdrawals.",
    icon: "Z",
  },
  {
    value: "VENMO",
    label: "Venmo",
    description:
      "Configure the Venmo account information used for withdrawals.",
    icon: "V",
  },
];

export default function WithdrawalSettingsPage() {
  const [configs, setConfigs] = useState<WithdrawalConfig[]>([]);
  const [selectedMethod, setSelectedMethod] =
    useState<WithdrawalMethod>("BANK_TRANSFER");

  const [displayName, setDisplayName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedConfig = configs.find(
    (config) => config.method === selectedMethod
  );

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/withdrawal-settings",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to load withdrawal settings."
        );
      }

      setConfigs(result.configs ?? []);
    } catch (err) {
      console.error(
        "Withdrawal settings load error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load withdrawal settings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const config = configs.find(
      (item) => item.method === selectedMethod
    );

    if (config) {
      setDisplayName(config.displayName);
      setInstructions(config.instructions ?? "");
      setIsEnabled(config.isEnabled);
      return;
    }

    const method = methods.find(
      (item) => item.value === selectedMethod
    );

    setDisplayName(method?.label ?? "");
    setInstructions("");
    setIsEnabled(true);
  }, [selectedMethod, configs]);

  async function saveSettings() {
    setMessage("");
    setError("");

    if (!displayName.trim()) {
      setError("A display name is required.");
      return;
    }

    if (displayName.trim().length > 100) {
      setError(
        "The display name cannot exceed 100 characters."
      );
      return;
    }

    if (instructions.trim().length > 5000) {
      setError(
        "Instructions cannot exceed 5,000 characters."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/withdrawal-settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            method: selectedMethod,
            displayName: displayName.trim(),
            instructions: instructions.trim() || null,
            isEnabled,
          }),
        }
      );

      const result: ApiResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to save withdrawal settings."
        );
      }

      setMessage(
        result.message ||
          "Withdrawal settings saved successfully."
      );

      await loadSettings();
    } catch (err) {
      console.error(
        "Withdrawal settings save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save withdrawal settings."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleMethod(
    config: WithdrawalConfig
  ) {
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/admin/withdrawal-settings",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: config.id,
            isEnabled: !config.isEnabled,
          }),
        }
      );

      const result: ApiResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to update withdrawal method."
        );
      }

      setMessage(
        result.message ||
          "Withdrawal method updated successfully."
      );

      await loadSettings();
    } catch (err) {
      console.error(
        "Withdrawal method toggle error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update withdrawal method."
      );
    }
  }

  function getConfig(method: WithdrawalMethod) {
    return configs.find(
      (config) => config.method === method
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050706] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />

            <p className="mt-4 text-sm text-zinc-500">
              Loading withdrawal settings...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050706] text-white">
      <div className="min-h-screen">
        {/* HEADER */}
        <header className="border-b border-white/10 bg-[#080a09]">
          <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
                  Administration
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                  Withdrawal Settings
                </h1>

                <p className="mt-1 max-w-2xl text-sm text-zinc-500">
                  Configure the withdrawal methods available
                  to Edge Portfolio users.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
                <p className="text-xs text-zinc-500">
                  Active methods
                </p>

                <p className="mt-1 text-lg font-semibold text-emerald-400">
                  {
                    configs.filter(
                      (config) => config.isEnabled
                    ).length
                  }{" "}
                  / {methods.length}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          {/* MESSAGES */}
          {message && (
            <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            {/* METHODS */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="px-2 pb-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-400">
                  Withdrawal channels
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Available methods
                </h2>
              </div>

              <div className="space-y-2">
                {methods.map((method) => {
                  const config = getConfig(
                    method.value
                  );

                  const active =
                    selectedMethod === method.value;

                  const enabled =
                    config?.isEnabled ?? false;

                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() =>
                        setSelectedMethod(
                          method.value
                        )
                      }
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-emerald-400/30 bg-emerald-400/10"
                          : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            active
                              ? "bg-emerald-400/15 text-emerald-400"
                              : "bg-white/5 text-zinc-400"
                          }`}
                        >
                          {method.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-sm font-medium ${
                                active
                                  ? "text-white"
                                  : "text-zinc-300"
                              }`}
                            >
                              {method.label}
                            </p>

                            <span
                              className={`h-2 w-2 rounded-full ${
                                enabled
                                  ? "bg-emerald-400"
                                  : "bg-zinc-700"
                              }`}
                            />
                          </div>

                          <p className="mt-1 text-xs leading-5 text-zinc-600">
                            {method.description}
                          </p>

                          <p
                            className={`mt-2 text-[11px] ${
                              enabled
                                ? "text-emerald-400"
                                : "text-zinc-600"
                            }`}
                          >
                            {enabled
                              ? "Enabled"
                              : "Disabled"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* EDITOR */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-400">
                    Method configuration
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold">
                    {
                      methods.find(
                        (method) =>
                          method.value ===
                          selectedMethod
                      )?.label
                    }
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                    These settings determine what users
                    see when they select this withdrawal
                    method.
                  </p>
                </div>

                <div
                  className={`rounded-xl border px-4 py-2 text-xs font-medium ${
                    isEnabled
                      ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-400"
                      : "border-white/10 bg-white/[0.03] text-zinc-500"
                  }`}
                >
                  {isEnabled
                    ? "Method enabled"
                    : "Method disabled"}
                </div>
              </div>

              <div className="mt-8 space-y-6">
                {/* DISPLAY NAME */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Display name
                  </label>

                  <input
                    value={displayName}
                    onChange={(event) =>
                      setDisplayName(
                        event.target.value
                      )
                    }
                    maxLength={100}
                    placeholder="Withdrawal method name"
                    className="admin-input"
                  />

                  <p className="mt-2 text-xs text-zinc-600">
                    This name will be displayed to users.
                  </p>
                </div>

                {/* INSTRUCTIONS */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Withdrawal instructions
                  </label>

                  <textarea
                    value={instructions}
                    onChange={(event) =>
                      setInstructions(
                        event.target.value
                      )
                    }
                    rows={10}
                    maxLength={5000}
                    placeholder={
                      selectedMethod ===
                      "BANK_TRANSFER"
                        ? "Enter the bank withdrawal instructions users should follow..."
                        : "Enter the account information and instructions users should follow..."
                    }
                    className="admin-input resize-none"
                  />

                  <div className="mt-2 flex justify-between text-xs text-zinc-600">
                    <span>
                      Users will see these instructions
                      when submitting a withdrawal.
                    </span>

                    <span>
                      {instructions.length}/5000
                    </span>
                  </div>
                </div>

                {/* ENABLE */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Enable withdrawal method
                      </p>

                      <p className="mt-1 text-xs leading-5 text-zinc-600">
                        Disabled methods will not be available
                        for new withdrawal requests.
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-pressed={isEnabled}
                      onClick={() =>
                        setIsEnabled(
                          (current) => !current
                        )
                      }
                      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                        isEnabled
                          ? "bg-emerald-500"
                          : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                          isEnabled
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* SAVE */}
                <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {selectedConfig && (
                      <p className="text-xs text-zinc-600">
                        Last updated{" "}
                        {new Date(
                          selectedConfig.updatedAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveSettings}
                    className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : "Save withdrawal settings"}
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* CURRENT CONFIGURATIONS */}
          <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-400">
                  Overview
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Withdrawal methods
                </h2>
              </div>

              <p className="text-xs text-zinc-600">
                Users can only request withdrawals through
                enabled methods.
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <div className="hidden grid-cols-[1fr_160px_120px] border-b border-white/10 bg-black/20 px-5 py-3 text-xs uppercase tracking-wider text-zinc-600 sm:grid">
                <span>Method</span>
                <span>Status</span>
                <span className="text-right">
                  Action
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {methods.map((method) => {
                  const config = getConfig(
                    method.value
                  );

                  const enabled =
                    config?.isEnabled ?? false;

                  return (
                    <div
                      key={method.value}
                      className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_160px_120px] sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-sm font-bold text-zinc-400">
                          {method.icon}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            {config?.displayName ||
                              method.label}
                          </p>

                          <p className="text-xs text-zinc-600">
                            {method.value}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            enabled
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-white/5 text-zinc-600"
                          }`}
                        >
                          {enabled
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </div>

                      <div className="sm:text-right">
                        {config ? (
                          <button
                            type="button"
                            onClick={() =>
                              toggleMethod(
                                config
                              )
                            }
                            className="text-xs font-medium text-zinc-500 transition hover:text-white"
                          >
                            {enabled
                              ? "Disable"
                              : "Enable"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedMethod(
                                method.value
                              )
                            }
                            className="text-xs font-medium text-emerald-400 transition hover:text-emerald-300"
                          >
                            Configure
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* IMPORTANT NOTICE */}
          <section className="mt-6 rounded-3xl border border-yellow-400/10 bg-yellow-400/[0.03] p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 font-semibold text-yellow-400">
                !
              </div>

              <div>
                <h3 className="font-medium text-yellow-300">
                  Withdrawal approval
                </h3>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Enabling a withdrawal method does not
                  automatically approve withdrawals. Every
                  withdrawal request will remain pending until
                  an administrator reviews and approves or
                  declines it.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          border-radius: 0.875rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.3);
          padding: 0.8rem 1rem;
          font-size: 0.875rem;
          line-height: 1.5rem;
          color: white;
          outline: none;
          transition:
            border-color 150ms ease,
            background-color 150ms ease;
        }

        .admin-input::placeholder {
          color: rgb(63 63 70);
        }

        .admin-input:focus {
          border-color: rgba(52, 211, 153, 0.5);
          background: rgba(0, 0, 0, 0.4);
        }

        .admin-input:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </main>
  );
}