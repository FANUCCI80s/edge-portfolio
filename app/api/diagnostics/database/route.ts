import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;

  let parsedHost = "missing";
  let parsedDatabase = "unknown";

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      parsedHost = url.hostname;
      parsedDatabase = url.pathname.replace("/", "") || "unknown";
    } catch {
      parsedHost = "invalid-url";
    }
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      configured: Boolean(databaseUrl),
      host: parsedHost,
      database: parsedDatabase,
      connection: "success",
    });
  } catch (error) {
    console.error("Database diagnostic error:", error);

    return NextResponse.json(
      {
        configured: Boolean(databaseUrl),
        host: parsedHost,
        database: parsedDatabase,
        connection: "failed",
        error:
          error instanceof Error
            ? error.message
            : "Unknown database connection error",
      },
      { status: 500 }
    );
  }
}