import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";

export async function POST(request: Request) {
try {
const user = await requireUser();

const body = await request.json();

const dateOfBirth =
  typeof body.dateOfBirth === "string"
    ? body.dateOfBirth.trim()
    : "";

const nationality =
  typeof body.nationality === "string"
    ? body.nationality.trim()
    : "";

const countryOfResidence =
  typeof body.countryOfResidence === "string"
    ? body.countryOfResidence.trim()
    : "";

const residentialAddress =
  typeof body.residentialAddress === "string"
    ? body.residentialAddress.trim()
    : "";

const city =
  typeof body.city === "string"
    ? body.city.trim()
    : "";

const state =
  typeof body.state === "string"
    ? body.state.trim()
    : "";

const postalCode =
  typeof body.postalCode === "string"
    ? body.postalCode.trim()
    : "";

const governmentIdType =
  typeof body.governmentIdType === "string"
    ? body.governmentIdType.trim()
    : "";

const governmentIdNumber =
  typeof body.governmentIdNumber === "string"
    ? body.governmentIdNumber.trim()
    : "";

if (
  !dateOfBirth ||
  !nationality ||
  !countryOfResidence ||
  !residentialAddress ||
  !city ||
  !state ||
  !postalCode ||
  !governmentIdType ||
  !governmentIdNumber
) {
  return NextResponse.json(
    {
      success: false,
      message: "All required KYC information must be completed.",
    },
    { status: 400 }
  );
}

const parsedDateOfBirth = new Date(dateOfBirth);

if (Number.isNaN(parsedDateOfBirth.getTime())) {
  return NextResponse.json(
    {
      success: false,
      message: "Please provide a valid date of birth.",
    },
    { status: 400 }
  );
}

if (parsedDateOfBirth >= new Date()) {
  return NextResponse.json(
    {
      success: false,
      message: "Date of birth must be in the past.",
    },
    { status: 400 }
  );
}

const kyc = await prisma.kycVerification.findUnique({
  where: {
    userId: user.id,
  },
  include: {
    idFrontFile: true,
    idBackFile: true,
  },
});

if (!kyc) {
  return NextResponse.json(
    {
      success: false,
      message: "KYC verification record was not found.",
    },
    { status: 404 }
  );
}

if (kyc.status === "APPROVED") {
  return NextResponse.json(
    {
      success: false,
      message: "Your KYC has already been approved.",
    },
    { status: 409 }
  );
}

if (kyc.status === "PENDING") {
  return NextResponse.json(
    {
      success: false,
      message: "Your KYC is already under review.",
    },
    { status: 409 }
  );
}

if (!kyc.idFrontFile) {
  return NextResponse.json(
    {
      success: false,
      message: "Please upload the front of your government ID.",
    },
    { status: 400 }
  );
}

if (!kyc.idBackFile) {
  return NextResponse.json(
    {
      success: false,
      message: "Please upload the back of your government ID.",
    },
    { status: 400 }
  );
}

const updatedKyc = await prisma.kycVerification.update({
  where: {
    id: kyc.id,
  },
  data: {
    dateOfBirth: parsedDateOfBirth,
    nationality,
    countryOfResidence,
    residentialAddress,
    city,
    state,
    postalCode,
    governmentIdType,
    governmentIdNumber,
    status: "PENDING",
    submittedAt: new Date(),
    reviewedAt: null,
    declineReason: null,
  },
});

return NextResponse.json({
  success: true,
  message:
    "Your KYC verification has been submitted successfully and is now under review.",
  kyc: {
    id: updatedKyc.id,
    status: updatedKyc.status,
    submittedAt: updatedKyc.submittedAt,
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
message: "You must be logged in to submit KYC.",
},
{ status: 401 }
);
}

console.error("KYC submission error:", error);

return NextResponse.json(
  {
    success: false,
    message: "Unable to submit your KYC verification.",
  },
  { status: 500 }
);

}
}