import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyLoginOtp } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const code =
      typeof body.code === "string"
        ? body.code.trim()
        : "";

    if (!email || !code) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and verification code are required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code must contain 6 digits.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        kyc: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to verify this request.",
        },
        { status: 401 }
      );
    }

    if (user.status === "BLOCKED") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account has been blocked.",
        },
        { status: 403 }
      );
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is currently suspended.",
        },
        { status: 403 }
      );
    }

    const verification = await verifyLoginOtp(
      user.id,
      code
    );

    if (!verification.success) {
      const messages: Record<string, string> = {
        OTP_NOT_FOUND:
          "No active verification code was found.",
        OTP_EXPIRED:
          "Your verification code has expired.",
        TOO_MANY_ATTEMPTS:
          "Too many attempts. Please request a new code.",
        INVALID_OTP:
          "The verification code is incorrect.",
      };

      const reason =
        verification.reason ?? "INVALID_OTP";

      return NextResponse.json(
        {
          success: false,
          message:
            messages[reason] ??
            "Unable to verify the code.",
        },
        { status: 401 }
      );
    }

    const userAgent =
      request.headers.get("user-agent") ?? undefined;

    const forwardedFor =
      request.headers.get("x-forwarded-for");

    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ?? undefined;

    await createSession(
      user.id,
      ipAddress,
      userAgent
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    const kycStatus =
  user.kyc?.status ?? "NOT_STARTED";

const redirectTo =
  user.role === "ADMIN"
    ? "/admin"
    : kycStatus === "APPROVED"
      ? "/dashboard"
      : "/kyc";

    return NextResponse.json({
      success: true,
      message: "Login verified successfully.",
      redirectTo,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        kycStatus,
      },
    });
  } catch (error) {
    console.error(
      "OTP verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify the code.",
      },
      { status: 500 }
    );
  }
}