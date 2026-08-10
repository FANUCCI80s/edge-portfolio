import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

if (!email) {
  return NextResponse.json(
    {
      success: false,
      message: "Email is required.",
    },
    { status: 400 }
  );
}

const user = await prisma.user.findUnique({
  where: {
    email,
  },
  select: {
    id: true,
    email: true,
    firstName: true,
    status: true,
  },
});

if (!user) {
  return NextResponse.json(
    {
      success: false,
      message: "Unable to resend the verification code.",
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
  message: "A new verification code has been sent to your email.",
  expiresAt: otp.expiresAt,
});

} catch (error) {
console.error("OTP resend error:", error);

return NextResponse.json(
  {
    success: false,
    message: "Unable to resend the verification code.",
  },
  { status: 500 }
);

}
}