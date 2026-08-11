
import { requireAuthenticatedPage } from "@/lib/auth/guards";
import KycForm from "./KycForm";

export default async function KycPage() {
  await requireAuthenticatedPage();

  return <KycForm />;
}

