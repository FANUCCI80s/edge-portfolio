import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  return NextResponse.json({
    resendConfigured: Boolean(apiKey),
    resendKeyLength: apiKey?.length ?? 0,
    resendKeyPrefix: apiKey ? apiKey.slice(0, 7) : null,
    emailFromConfigured: Boolean(fromEmail),
    emailFrom: fromEmail ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}