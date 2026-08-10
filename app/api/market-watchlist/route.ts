import { NextResponse } from "next/server";
import { requireAuthenticatedPage } from "@/lib/auth/guards";

type MarketItem = {
  symbol: string;
  name: string;
  category: "Crypto" | "Stocks" | "Forex";
  price: number;
  change: number | null;
  source: string;
};

async function fetchJson(
  url: string,
  options?: RequestInit
) {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `Market data request failed: ${response.status}`
    );
  }

  return response.json();
}

function calculateChange(
  current: number,
  previous: number
): number | null {
  if (
    !Number.isFinite(current) ||
    !Number.isFinite(previous) ||
    previous === 0
  ) {
    return null;
  }

  return Number(
    (((current - previous) / previous) * 100).toFixed(2)
  );
}

function roundPrice(price: number): number {
  if (price >= 1000) {
    return Number(price.toFixed(2));
  }

  if (price >= 1) {
    return Number(price.toFixed(4));
  }

  return Number(price.toFixed(6));
}

export async function GET() {
  try {
    await requireAuthenticatedPage();

    const markets: MarketItem[] = [];

    /*
     * ==========================================================
     * CRYPTO
     * CoinGecko
     * ==========================================================
     */

    try {
      const cryptoUrl =
        "https://api.coingecko.com/api/v3/coins/markets" +
        "?vs_currency=usd" +
        "&ids=bitcoin,ethereum,solana" +
        "&order=market_cap_desc" +
        "&per_page=3" +
        "&page=1" +
        "&sparkline=false" +
        "&price_change_percentage=24h";

      const cryptoData = await fetchJson(cryptoUrl);

      if (Array.isArray(cryptoData)) {
        const cryptoNames: Record<string, string> = {
          bitcoin: "Bitcoin",
          ethereum: "Ethereum",
          solana: "Solana",
        };

        const cryptoSymbols: Record<string, string> = {
          bitcoin: "BTC/USD",
          ethereum: "ETH/USD",
          solana: "SOL/USD",
        };

        for (const item of cryptoData) {
          const id = String(item.id || "");

          const price = Number(item.current_price);

          const change = Number(
            item.price_change_percentage_24h
          );

          if (!id || !Number.isFinite(price)) {
            continue;
          }

          markets.push({
            symbol:
              cryptoSymbols[id] ||
              `${String(item.symbol || "").toUpperCase()}/USD`,
            name:
              cryptoNames[id] ||
              String(item.name || id),
            category: "Crypto",
            price: roundPrice(price),
            change: Number.isFinite(change)
              ? Number(change.toFixed(2))
              : null,
            source: "CoinGecko",
          });
        }
      }
    } catch (error) {
      console.error(
        "CoinGecko error:",
        error
      );
    }

    /*
     * ==========================================================
     * STOCKS
     * Yahoo Finance chart endpoint
     *
     * No API key required for this endpoint.
     * ==========================================================
     */

    const stocks = [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
      },
      {
        symbol: "TSLA",
        name: "Tesla Inc.",
      },
      {
        symbol: "NVDA",
        name: "NVIDIA",
      },
    ];

    for (const stock of stocks) {
      try {
        const url =
          `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}` +
          "?range=2d" +
          "&interval=1d";

        const data = await fetchJson(url);

        const result =
          data?.chart?.result?.[0];

        if (!result) {
          console.error(
            `No Yahoo Finance result for ${stock.symbol}`
          );

          continue;
        }

        const meta = result.meta;

        const currentPrice = Number(
          meta?.regularMarketPrice
        );

        const previousClose = Number(
          meta?.previousClose ??
            meta?.chartPreviousClose
        );

        if (!Number.isFinite(currentPrice)) {
          console.error(
            `Invalid price for ${stock.symbol}`
          );

          continue;
        }

        const change = Number.isFinite(
          previousClose
        )
          ? calculateChange(
              currentPrice,
              previousClose
            )
          : null;

        markets.push({
          symbol: stock.symbol,
          name: stock.name,
          category: "Stocks",
          price: roundPrice(currentPrice),
          change,
          source: "Yahoo Finance",
        });
      } catch (error) {
        console.error(
          `Yahoo Finance error for ${stock.symbol}:`,
          error
        );
      }
    }

    /*
     * ==========================================================
     * FOREX
     * Frankfurter
     * ==========================================================
     */

    const forexPairs = [
      {
        base: "EUR",
        quote: "USD",
        name: "Euro / US Dollar",
      },
      {
        base: "GBP",
        quote: "USD",
        name: "British Pound / US Dollar",
      },
      {
        base: "USD",
        quote: "JPY",
        name: "US Dollar / Japanese Yen",
      },
    ];

    for (const pair of forexPairs) {
      try {
        const url =
          `https://api.frankfurter.dev/v2/rate/${pair.base}/${pair.quote}`;

        const data = await fetchJson(url);

        const rate = Number(data.rate);

        if (!Number.isFinite(rate)) {
          continue;
        }

        markets.push({
          symbol: `${pair.base}/${pair.quote}`,
          name: pair.name,
          category: "Forex",
          price: roundPrice(rate),
          change: null,
          source: "Frankfurter",
        });
      } catch (error) {
        console.error(
          `Frankfurter error for ${pair.base}/${pair.quote}:`,
          error
        );
      }
    }

    /*
     * ==========================================================
     * REMOVE DUPLICATES
     * ==========================================================
     */

    const uniqueMarkets = Array.from(
      new Map(
        markets.map((market) => [
          `${market.category}:${market.symbol}`,
          market,
        ])
      ).values()
    );

    /*
     * ==========================================================
     * RESPONSE
     * ==========================================================
     */

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
      count: uniqueMarkets.length,
      markets: uniqueMarkets,
    });
  } catch (error) {
    console.error(
      "Market watchlist API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load market data.",
        markets: [],
      },
      {
        status: 500,
      }
    );
  }
}