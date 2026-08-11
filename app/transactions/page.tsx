import { requireAuthenticatedPage } from "@/lib/auth/guards";
import TransactionsClient from "./TransactionsClient";

export default async function TransactionsPage() {
  await requireAuthenticatedPage();

  return <TransactionsClient />;
}