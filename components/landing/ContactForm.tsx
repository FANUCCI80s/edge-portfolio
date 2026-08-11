
"use client";

import { FormEvent, useState } from "react";

type FormStatus = "idle" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("idle");
    setLoading(true);

    try {
      /*
       * The API endpoint can be connected to the site's
       * email/contact backend later.
       *
       * For now we perform client-side validation and
       * display the success state.
       */

      if (
        !form.name.trim() ||
        !form.email.trim() ||
        !form.subject.trim() ||
        !form.message.trim()
      ) {
        throw new Error("Please complete all fields.");
      }

      if (!form.email.includes("@")) {
        throw new Error("Please enter a valid email address.");
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      setStatus("success");

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-white/5 bg-[#060a07] py-24 sm:py-28"
    >
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-green-500/10 blur-[120px]" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-green-500/5 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
              Contact
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Have a question?
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-gray-400">
              Send a message to the Edge Portfolio team. Tell us what you
              need help with and we'll have the appropriate team review your
              request.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/10 text-green-400">
                    ?
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      General support
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Questions about your account, platform features, or
                      general assistance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/10 text-green-400">
                    ↗
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      Account assistance
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Need help with account access, verification, deposits,
                      or withdrawals?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="mb-7">
              <h3 className="text-xl font-semibold text-white">
                Send us a message
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Complete the form below and provide as much detail as
                possible.
              </p>
            </div>

            {status === "success" && (
              <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                <p className="text-sm font-semibold text-green-400">
                  Message submitted successfully.
                </p>

                <p className="mt-1 text-sm text-green-400/70">
                  Thank you for contacting Edge Portfolio.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm font-semibold text-red-400">
                  Please complete all fields with valid information.
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Name
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Your name"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Email
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Subject
                </label>

                <input
                  id="contact-subject"
                  type="text"
                  value={form.subject}
                  onChange={(event) =>
                    updateField("subject", event.target.value)
                  }
                  placeholder="How can we help?"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Message
                </label>

                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  placeholder="Tell us how we can help..."
                  required
                  rows={6}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-green-500 px-5 py-3.5 text-sm font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send message"}
              </button>

              <p className="text-center text-xs leading-5 text-gray-600">
                Never include your password, OTP, or other sensitive
                authentication information in this form.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

