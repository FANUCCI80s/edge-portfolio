import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";

const OTP_LENGTH = 6;
const OTP_EXPIRATION_MINUTES = 10;

function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function createLoginOtp(userId: string) {
  const code = randomInt(100000, 1000000).toString();

  const codeHash = hashOtp(code);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000
  );

  await prisma.otpCode.updateMany({
    where: {
      userId,
      purpose: "LOGIN",
      status: "PENDING",
    },
    data: {
      status: "EXPIRED",
    },
  });

  await prisma.otpCode.create({
    data: {
      userId,
      codeHash,
      purpose: "LOGIN",
      status: "PENDING",
      expiresAt,
    },
  });

  return {
    code,
    expiresAt,
  };
}

export async function verifyLoginOtp(
  userId: string,
  code: string
) {
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId,
      purpose: "LOGIN",
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!otp) {
    return {
      success: false,
      reason: "OTP_NOT_FOUND",
    };
  }

  if (otp.expiresAt <= new Date()) {
    await prisma.otpCode.update({
      where: {
        id: otp.id,
      },
      data: {
        status: "EXPIRED",
      },
    });

    return {
      success: false,
      reason: "OTP_EXPIRED",
    };
  }

  if (otp.attempts >= 5) {
    await prisma.otpCode.update({
      where: {
        id: otp.id,
      },
      data: {
        status: "EXPIRED",
      },
    });

    return {
      success: false,
      reason: "TOO_MANY_ATTEMPTS",
    };
  }

  const codeHash = hashOtp(code);

  if (codeHash !== otp.codeHash) {
    await prisma.otpCode.update({
      where: {
        id: otp.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    return {
      success: false,
      reason: "INVALID_OTP",
    };
  }

  await prisma.otpCode.update({
    where: {
      id: otp.id,
    },
    data: {
      status: "USED",
      usedAt: new Date(),
    },
  });

  return {
    success: true,
  };
}