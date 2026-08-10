"use client";

import { FormEvent, useEffect, useState } from "react";

type PlatformSettings = {
id: string;
platformName: string;
logoUrl: string | null;
primaryColor: string;
secondaryColor: string;
accentColor: string;
};

export default function AdminSettingsPage() {
const [settings, setSettings] = useState<PlatformSettings | null>(null);

const [platformName, setPlatformName] = useState("Edge Portfolio");
const [logoUrl, setLogoUrl] = useState("");
const [primaryColor, setPrimaryColor] = useState("#22c55e");
const [secondaryColor, setSecondaryColor] = useState("#050806");
const [accentColor, setAccentColor] = useState("#16a34a");

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

async function parseResponse(response: Response) {
const contentType = response.headers.get("content-type") || "";
const text = await response.text();


if (!contentType.includes("application/json")) {
  throw new Error(
    `The settings API returned a non-JSON response (${response.status}).`
  );
}

try {
  return JSON.parse(text);
} catch {
  throw new Error(
    `The settings API returned invalid JSON (${response.status}).`
  );
}


}

async function loadSettings() {
try {
setLoading(true);
setError("");


  const response = await fetch("/api/admin/settings", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await parseResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(
      data.error ||
        data.message ||
        "Unable to load platform settings."
    );
  }

  const loaded = data.settings;

  if (!loaded) {
    throw new Error("Platform settings were not returned by the server.");
  }

  setSettings(loaded);
  setPlatformName(loaded.platformName || "Edge Portfolio");
  setLogoUrl(loaded.logoUrl || "");
  setPrimaryColor(loaded.primaryColor || "#22c55e");
  setSecondaryColor(loaded.secondaryColor || "#050806");
  setAccentColor(loaded.accentColor || "#16a34a");
} catch (err) {
  console.error("Admin settings load error:", err);

  setError(
    err instanceof Error
      ? err.message
      : "Unable to load platform settings."
  );
} finally {
  setLoading(false);
}


}

useEffect(() => {
loadSettings();
}, []);

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();


try {
  setSaving(true);
  setError("");
  setSuccess("");

  const response = await fetch("/api/admin/settings", {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      platformName: platformName.trim(),
      logoUrl: logoUrl.trim() || null,
      primaryColor,
      secondaryColor,
      accentColor,
    }),
  });

  const data = await parseResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(
      data.error ||
        data.message ||
        "Unable to save platform settings."
    );
  }

  setSettings(data.settings);

  setPlatformName(data.settings.platformName || "Edge Portfolio");
  setLogoUrl(data.settings.logoUrl || "");
  setPrimaryColor(data.settings.primaryColor || "#22c55e");
  setSecondaryColor(data.settings.secondaryColor || "#050806");
  setAccentColor(data.settings.accentColor || "#16a34a");

  setSuccess("Platform settings saved successfully.");
} catch (err) {
  console.error("Admin settings save error:", err);

  setError(
    err instanceof Error
      ? err.message
      : "Unable to save platform settings."
  );
} finally {
  setSaving(false);
}


}

if (loading) {
return ( <main className="min-h-screen bg-[#050806] text-white"> <div className="flex min-h-screen items-center justify-center"> <div className="text-center"> <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-green-500/20 border-t-green-500" /> <p className="text-sm text-gray-400">
Loading platform settings... </p> </div> </div> </main>
);
}

return ( <main className="min-h-screen bg-[#050806] text-white"> <div className="mx-auto max-w-6xl px-6 py-10"> <div className="mb-8"> <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-500">
Admin Panel </p>


      <h1 className="text-3xl font-bold">
        Platform Settings
      </h1>

      <p className="mt-2 text-sm text-gray-400">
        Manage the basic branding settings for Edge Portfolio.
      </p>
    </div>

    {error && (
      <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    )}

    {success && (
      <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
        {success}
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Platform Branding
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Update the name, logo, and colors used by the platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="platformName"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Platform Name
            </label>

            <input
              id="platformName"
              type="text"
              value={platformName}
              onChange={(event) =>
                setPlatformName(event.target.value)
              }
              placeholder="Edge Portfolio"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-green-500/50"
            />
          </div>

          <div>
            <label
              htmlFor="logoUrl"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Logo URL
            </label>

            <input
              id="logoUrl"
              type="text"
              value={logoUrl}
              onChange={(event) =>
                setLogoUrl(event.target.value)
              }
              placeholder="https://example.com/logo.png"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-green-500/50"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Platform Colors
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Select the primary, secondary, and accent colors.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <ColorField
            label="Primary Color"
            value={primaryColor}
            onChange={setPrimaryColor}
          />

          <ColorField
            label="Secondary Color"
            value={secondaryColor}
            onChange={setSecondaryColor}
          />

          <ColorField
            label="Accent Color"
            value={accentColor}
            onChange={setAccentColor}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Preview
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Preview your current branding settings.
          </p>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-white/10"
          style={{
            backgroundColor: secondaryColor,
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={platformName}
                  className="h-10 w-10 rounded-xl object-contain"
                />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-black"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  EP
                </div>
              )}

              <span className="font-semibold">
                {platformName || "Edge Portfolio"}
              </span>
            </div>

            <div
              className="rounded-lg px-4 py-2 text-sm font-semibold text-black"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              Dashboard
            </div>
          </div>

          <div className="p-6">
            <div
              className="rounded-xl border p-5"
              style={{
                borderColor: `${accentColor}55`,
              }}
            >
              <p className="text-sm text-gray-400">
                Available Balance
              </p>

              <p className="mt-2 text-3xl font-bold">
                $25,000.00
              </p>

              <button
                type="button"
                className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-black"
                style={{
                  backgroundColor: accentColor,
                }}
              >
                View Portfolio
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>

    <section className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
      <h2 className="text-lg font-semibold text-yellow-400">
        Admin Password
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-400">
        Change your administrator password from the secure
        password management page.
      </p>

      <a
        href="/settings/password"
        className="mt-4 inline-flex rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-500/20"
      >
        Reset Admin Password
      </a>
    </section>
  </div>
</main>


);
}

function ColorField({
label,
value,
onChange,
}: {
label: string;
value: string;
onChange: (value: string) => void;
}) {
const validColor = /^#[0-9A-Fa-f]{6}$/.test(value)
? value
: "#22c55e";

return ( <div> <label className="mb-2 block text-sm font-medium text-gray-300">
{label} </label>


  <div className="flex gap-3">
    <input
      type="color"
      value={validColor}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-14 cursor-pointer rounded-lg border border-white/10 bg-black/30 p-1"
    />

    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="#22c55e"
      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-green-500/50"
    />
  </div>
</div>


);
}
