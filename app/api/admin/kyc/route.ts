import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
try {
await requireAdmin();

const applications = await prisma.kycVerification.findMany({
  where: {
    status: "PENDING",
  },
  orderBy: [
    {
      submittedAt: "asc",
    },
    {
      createdAt: "asc",
    },
  ],
  include: {
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        status: true,
      },
    },
    idFrontFile: {
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
      },
    },
    idBackFile: {
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
      },
    },
  },
});

return NextResponse.json({
  success: true,
  applications,
});

} catch (error) {
if (
error instanceof Error &&
error.message === "UNAUTHORIZED"
) {
return NextResponse.json(
{
success: false,
message: "You must be logged in.",
},
{ status: 401 }
);
}

if (
  error instanceof Error &&
  error.message === "FORBIDDEN"
) {
  return NextResponse.json(
    {
      success: false,
      message: "Administrator access is required.",
    },
    { status: 403 }
  );
}

console.error("Admin KYC list error:", error);

return NextResponse.json(
  {
    success: false,
    message: "Unable to load KYC applications.",
  },
  { status: 500 }
);

}
}