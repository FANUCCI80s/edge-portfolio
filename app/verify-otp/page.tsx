
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import VerifyOtpForm from "./VerifyOtpForm";

export default async function VerifyOtpPage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.kyc?.status !== "APPROVED") {
      redirect("/kyc");
    }

    redirect("/dashboard");
  }

  return <VerifyOtpForm />;
}

