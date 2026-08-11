
"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is Edge Portfolio?",
    answer:
      "Edge Portfolio is a modern trading platform designed to give users access to crypto, forex, and stock markets through one streamlined account.",
  },
  {
    question: "How do I create an account?",
    answer:
      "Select Sign Up, provide your basic account information, and follow the verification steps. Once your account is created, you can complete the required KYC process.",
  },
  {
    question: "Do I need to complete KYC?",
    answer:
      "Yes. Identity verification helps protect your account and is required before certain account functions, including deposits, can be accessed.",
  },
  {
    question: "What markets can I trade?",
    answer:
      "Edge Portfolio is designed to provide access to cryptocurrency, forex, and stock markets from your trading dashboard.",
  },
  {
    question: "How can I deposit funds?",
    answer:
      "Available deposit methods are displayed in your account. Select your preferred method, follow the provided instructions, submit your payment information and proof where required, and wait for the deposit to be reviewed.",
  },
  {
    question: "How long does a deposit take?",
    answer:
      "Deposit processing time can vary depending on the payment method and verification process. Your account will show the status of your deposit request.",
  },
  {
    question: "How do withdrawals work?",
    answer:
      "Choose Withdrawals from your account, enter the requested information, select an available withdrawal method, and submit your request for review.",
  },
  {
    question: "Is my account protected?",
    answer:
      "Edge Portfolio is designed with account security and verification controls to help protect user accounts and transactions.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden border-t border-white/5 bg-[#050806] py-24 sm:py-28"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-green-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
            FAQ
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Frequently asked questions
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-400 sm:text-lg">
            Find answers to some of the most common questions about Edge
            Portfolio.
          </p>
        </div>

        <div className="mt-14 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className={`overflow-hidden rounded-2xl border transition ${
                  isOpen
                    ? "border-green-500/20 bg-green-500/[0.04]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                >
                  <span className="text-sm font-semibold text-white sm:text-base">
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg transition ${
                      isOpen
                        ? "rotate-45 border-green-500/30 bg-green-500/10 text-green-400"
                        : "border-white/10 bg-white/5 text-gray-400"
                    }`}
                  >
                    +
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-sm leading-7 text-gray-400 sm:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

