import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type RouteContext = {
params: Promise<{
id: string;
}>;
};

export async function GET(
request: Request,
context: RouteContext
) {
try {
await requireAdmin();

const { id } = await context.params;

const kyc = await prisma.kycVerification.findUnique({
  where: {
    id,
  },
  include: {
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    },
    idFrontFile: {
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
    },
    idBackFile: {
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
    },
  },
});

if (!kyc) {
  return NextResponse.json(
    {
      success: false,
      message: "KYC application not found.",
    },
    { status: 404 }
  );
}

return NextResponse.json({
  success: true,
  kyc,
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

console.error("Admin KYC detail error:", error);

return NextResponse.json(
  {
    success: false,
    message: "Unable to load KYC application.",
  },
  { status: 500 }
);

}
}

export async function PATCH(
request: Request,
context: RouteContext
) {
try {
const admin = await requireAdmin();

const { id } = await context.params;

let body: unknown;

try {
  body = await request.json();
} catch {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid request body.",
    },
    { status: 400 }
  );
}

if (
  typeof body !== "object" ||
  body === null
) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid request body.",
    },
    { status: 400 }
  );
}

const action =
  "action" in body &&
  typeof body.action === "string"
    ? body.action.trim().toUpperCase()
    : "";

const declineReason =
  "declineReason" in body &&
  typeof body.declineReason === "string"
    ? body.declineReason.trim()
    : "";

if (
  action !== "APPROVE" &&
  action !== "DECLINE"
) {
  return NextResponse.json(
    {
      success: false,
      message:
        "Action must be APPROVE or DECLINE.",
    },
    { status: 400 }
  );
}

if (
  action === "DECLINE" &&
  !declineReason
) {
  return NextResponse.json(
    {
      success: false,
      message:
        "A decline reason is required.",
    },
    { status: 400 }
  );
}

if (declineReason.length > 2000) {
  return NextResponse.json(
    {
      success: false,
      message:
        "The decline reason cannot exceed 2,000 characters.",
    },
    { status: 400 }
  );
}

const kyc =
  await prisma.kycVerification.findUnique({
    where: {
      id,
    },
  });

if (!kyc) {
  return NextResponse.json(
    {
      success: false,
      message: "KYC application not found.",
    },
    { status: 404 }
  );
}

if (kyc.status !== "PENDING") {
  return NextResponse.json(
    {
      success: false,
      message:
        "Only KYC applications under review can be processed.",
    },
    { status: 409 }
  );
}

if (action === "APPROVE") {
  const updatedKyc =
    await prisma.kycVerification.update({
      where: {
        id: kyc.id,
      },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        declineReason: null,
      },
    });

  return NextResponse.json({
    success: true,
    message:
      "KYC verification approved successfully.",
    kyc: {
      id: updatedKyc.id,
      status: updatedKyc.status,
      reviewedAt: updatedKyc.reviewedAt,
    },
  });
}

const updatedKyc =
  await prisma.kycVerification.update({
    where: {
      id: kyc.id,
    },
    data: {
      status: "DECLINED",
      reviewedAt: new Date(),
      declineReason,
    },
  });

console.log(
  `Admin ${admin.id} declined KYC ${kyc.id}`
);

return NextResponse.json({
  success: true,
  message:
    "KYC verification declined successfully.",
  kyc: {
    id: updatedKyc.id,
    status: updatedKyc.status,
    reviewedAt: updatedKyc.reviewedAt,
    declineReason: updatedKyc.declineReason,
  },
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

console.error(
  "Admin KYC review error:",
  error
);

return NextResponse.json(
  {
    success: false,
    message:
      "Unable to process this KYC application.",
  },
  { status: 500 }
);

}
}