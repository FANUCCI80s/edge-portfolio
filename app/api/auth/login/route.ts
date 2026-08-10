import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createLoginOtp } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email/send";
import { loginOtpEmail } from "@/lib/email/templates";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
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
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
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

    const otp = await createLoginOtp(user.id);

    const emailContent = loginOtpEmail(
      user.firstName,
      otp.code
    );

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return NextResponse.json({
      success: true,
      otpRequired: true,
      message:
        "A verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete login.",
      },
      { status: 500 }
    );
  }
}