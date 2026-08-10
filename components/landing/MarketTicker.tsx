"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const markets = [
["BTC/USD", "$67,842.21", "+4.82%"],
["ETH/USD", "$3,842.17", "+3.41%"],
["EUR/USD", "1.16842", "+0.64%"],
["GBP/USD", "1.35481", "+0.51%"],
["AAPL", "$228.17", "+2.31%"],
["NVDA", "$181.92", "+3.87%"],
];

export default function MarketTicker() {
return ( <section className="border-y border-white/5 bg-[#080a09]"> <div className="overflow-hidden">
<motion.div
animate={{ x: ["0%", "-50%"] }}
transition={{
duration: 28,
repeat: Infinity,
ease: "linear",
}}
className="flex w-max"
>
{[...markets, ...markets].map(([symbol, price, change], index) => (
<div
key={`${symbol}-${index}`}
className="flex min-w-[190px] items-center gap-3 border-r border-white/5 px-6 py-4"
> <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />


          <span className="text-xs font-semibold text-zinc-300">
            {symbol}
          </span>

          <span className="text-xs text-zinc-500">{price}</span>

          <span className="text-xs font-medium text-emerald-400">
            {change}
          </span>
        </div>
      ))}
    </motion.div>
  </div>
</section>


);
}
