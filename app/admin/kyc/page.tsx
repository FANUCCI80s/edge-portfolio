import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

function formatDate(date: Date | null) {
if (!date) {
return "—";
}

return new Intl.DateTimeFormat("en-US", {
month: "short",
day: "numeric",
year: "numeric",
hour: "numeric",
minute: "2-digit",
}).format(date);
}

function getStatusClass(status: string) {
switch (status) {
case "APPROVED":
return "bg-emerald-400/10 text-emerald-400";


case "DECLINED":
  return "bg-red-400/10 text-red-400";

case "PENDING":
  return "bg-yellow-400/10 text-yellow-400";

case "NOT_STARTED":
  return "bg-white/10 text-zinc-500";

default:
  return "bg-white/10 text-zinc-400";


}
}

export default async function AdminKycPage() {
await requireAdmin();

const kycRecords = await prisma.kycVerification.findMany({
orderBy: {
createdAt: "desc",
},
include: {
user: true,
},
});

const totalKyc = kycRecords.length;

const pendingKyc = kycRecords.filter(
(kyc) => kyc.status === "PENDING"
).length;

const approvedKyc = kycRecords.filter(
(kyc) => kyc.status === "APPROVED"
).length;

const declinedKyc = kycRecords.filter(
(kyc) => kyc.status === "DECLINED"
).length;

return ( <main className="min-h-screen bg-[#050706] text-white"> <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10"> <div className="mb-8"> <Link
         href="/admin"
         className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-emerald-400"
       >
← Admin Dashboard </Link>


      <p className="mt-6 text-sm font-medium text-emerald-400">
        Identity verification
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        KYC Management
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
        Review registered users, inspect submitted identity
        information, and manage KYC verification requests.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm text-zinc-500">
          Total KYC records
        </p>

        <p className="mt-3 text-3xl font-semibold">
          {totalKyc}
        </p>

        <p className="mt-2 text-xs text-zinc-600">
          All verification records
        </p>
      </div>

      <div className="rounded-3xl border border-yellow-400/10 bg-yellow-400/[0.03] p-6">
        <p className="text-sm text-zinc-500">
          Pending review
        </p>

        <p className="mt-3 text-3xl font-semibold text-yellow-400">
          {pendingKyc}
        </p>

        <p className="mt-2 text-xs text-zinc-600">
          Require administrator attention
        </p>
      </div>

      <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.05] p-6">
        <p className="text-sm text-zinc-500">
          Approved
        </p>

        <p className="mt-3 text-3xl font-semibold text-emerald-400">
          {approvedKyc}
        </p>

        <p className="mt-2 text-xs text-zinc-600">
          Successfully verified users
        </p>
      </div>

      <div className="rounded-3xl border border-red-400/10 bg-red-400/[0.03] p-6">
        <p className="text-sm text-zinc-500">
          Declined
        </p>

        <p className="mt-3 text-3xl font-semibold text-red-400">
          {declinedKyc}
        </p>

        <p className="mt-2 text-xs text-zinc-600">
          Verification requests declined
        </p>
      </div>
    </div>

    <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              Verification queue
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              KYC submissions
            </h2>
          </div>

          <span className="w-fit rounded-full bg-white/[0.05] px-3 py-1 text-xs text-zinc-500">
            {kycRecords.length} records
          </span>
        </div>
      </div>

      {kycRecords.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] text-zinc-500">
            ◌
          </div>

          <h3 className="mt-4 font-medium">
            No KYC records found
          </h3>

          <p className="mt-2 text-sm text-zinc-600">
            KYC submissions will appear here when users submit
            their verification information.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-600">
                  <th className="px-6 py-4 font-medium">
                    User
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Country
                  </th>

                  <th className="px-6 py-4 font-medium">
                    ID Type
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Submitted
                  </th>

                  <th className="px-6 py-4 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {kycRecords.map((kyc) => (
                  <tr
                    key={kyc.id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 font-semibold text-emerald-400">
                          {(
                            kyc.user.firstName ||
                            kyc.user.email ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {kyc.user.firstName}{" "}
                            {kyc.user.lastName}
                          </p>

                          <p className="mt-1 max-w-[240px] truncate text-xs text-zinc-600">
                            {kyc.user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-zinc-400">
                      {kyc.countryOfResidence || "—"}
                    </td>

                    <td className="px-6 py-5 text-sm text-zinc-400">
                      {kyc.governmentIdType || "—"}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                          kyc.status
                        )}`}
                      >
                        {kyc.status}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-zinc-500">
                      {formatDate(kyc.submittedAt)}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/admin/kyc/${kyc.id}`}
                        className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-400"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-white/10 lg:hidden">
            {kycRecords.map((kyc) => (
              <div
                key={kyc.id}
                className="p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 font-semibold text-emerald-400">
                      {(
                        kyc.user.firstName ||
                        kyc.user.email ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {kyc.user.firstName}{" "}
                        {kyc.user.lastName}
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-600">
                        {kyc.user.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                      kyc.status
                    )}`}
                  >
                    {kyc.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-zinc-600">
                      Country
                    </p>

                    <p className="mt-2 text-sm">
                      {kyc.countryOfResidence || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-zinc-600">
                      ID Type
                    </p>

                    <p className="mt-2 text-sm">
                      {kyc.governmentIdType || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-zinc-600">
                      Submitted
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                      {formatDate(kyc.submittedAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-zinc-600">
                      User status
                    </p>

                    <p className="mt-2 text-sm">
                      {kyc.user.status}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/admin/kyc/${kyc.id}`}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-emerald-400/30 hover:text-emerald-400"
                  >
                    Review KYC
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>

    <section className="mt-8 rounded-3xl border border-yellow-400/10 bg-yellow-400/[0.03] p-6">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
          !
        </div>

        <div>
          <h3 className="font-medium text-yellow-300">
            KYC review
          </h3>

          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Review submitted identity information and
            verification documents carefully before making
            a decision.
          </p>
        </div>
      </div>
    </section>

    <p className="mt-8 text-center text-xs text-zinc-700">
      Edge Portfolio • Admin • KYC Management
    </p>
  </div>
</main>


);
}
