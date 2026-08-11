
"use client";

import { useEffect, useState } from "react";

type Activity = {
  name: string;
  action: "Deposit successful" | "Withdrawal successful";
  amount: string;
  method: string;
};

const activities: Activity[] = [
  {
    name: "Michael R.",
    action: "Deposit successful",
    amount: "$2,500.00",
    method: "Bank Transfer",
  },
  {
    name: "Sarah T.",
    action: "Withdrawal successful",
    amount: "$1,250.00",
    method: "PayPal",
  },
  {
    name: "David K.",
    action: "Deposit successful",
    amount: "$5,000.00",
    method: "Cryptocurrency",
  },
  {
    name: "Amanda J.",
    action: "Withdrawal successful",
    amount: "$850.00",
    method: "Cash App",
  },
  {
    name: "James W.",
    action: "Deposit successful",
    amount: "$3,200.00",
    method: "Bank Transfer",
  },
  {
    name: "Daniel P.",
    action: "Withdrawal successful",
    amount: "$1,800.00",
    method: "Venmo",
  },
  {
    name: "Olivia M.",
    action: "Deposit successful",
    amount: "$4,750.00",
    method: "Cryptocurrency",
  },
  {
    name: "Robert H.",
    action: "Withdrawal successful",
    amount: "$2,100.00",
    method: "Bank Transfer",
  },
  {
    name: "Sophia L.",
    action: "Deposit successful",
    amount: "$1,500.00",
    method: "PayPal",
  },
  {
    name: "William B.",
    action: "Withdrawal successful",
    amount: "$975.00",
    method: "Cash App",
  },
  {
    name: "Emma C.",
    action: "Deposit successful",
    amount: "$6,200.00",
    method: "Bank Transfer",
  },
  {
    name: "Christopher D.",
    action: "Withdrawal successful",
    amount: "$3,450.00",
    method: "Venmo",
  },
  {
    name: "Mia S.",
    action: "Deposit successful",
    amount: "$2,850.00",
    method: "Cryptocurrency",
  },
  {
    name: "Joseph A.",
    action: "Withdrawal successful",
    amount: "$1,600.00",
    method: "PayPal",
  },
  {
    name: "Isabella N.",
    action: "Deposit successful",
    amount: "$7,500.00",
    method: "Bank Transfer",
  },
  {
    name: "Matthew G.",
    action: "Withdrawal successful",
    amount: "$2,750.00",
    method: "Cash App",
  },
  {
    name: "Charlotte E.",
    action: "Deposit successful",
    amount: "$3,900.00",
    method: "Cryptocurrency",
  },
  {
    name: "Benjamin F.",
    action: "Withdrawal successful",
    amount: "$1,450.00",
    method: "Venmo",
  },
  {
    name: "Amelia V.",
    action: "Deposit successful",
    amount: "$5,650.00",
    method: "PayPal",
  },
  {
    name: "Alexander P.",
    action: "Withdrawal successful",
    amount: "$2,300.00",
    method: "Bank Transfer",
  },
];

export default function ActivityNotifications() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        setCurrentIndex(
          (current) => (current + 1) % activities.length
        );

        setVisible(true);
      }, 500);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const activity = activities[currentIndex];

  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#050806] py-10">
      <div className="mx-auto flex max-w-6xl justify-center px-6 lg:px-8">
        <div
          className={`w-full max-w-md transition-all duration-500 ${
            visible
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
                <span className="text-lg text-green-400">
                  ✓
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-white">
                    {activity.name}
                  </p>

                  <span className="shrink-0 text-xs text-gray-600">
                    Just now
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-400">
                  {activity.action}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-400">
                    {activity.amount}
                  </span>

                  <span className="text-xs text-gray-600">
                    {activity.method}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] text-gray-700">
            Recent platform activity
          </p>
        </div>
      </div>
    </section>
  );
}

