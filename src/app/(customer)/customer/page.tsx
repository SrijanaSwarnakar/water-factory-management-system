import LogoutButton from "@/components/auth/LogoutButton";
import { requireRole } from "@/lib/authorization";

export default async function CustomerPage() {
  const session = await requireRole(["CUSTOMER"]);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Customer Portal</p>

            <h1 className="mt-1 text-3xl font-bold">
              Welcome, {session.user.name}
            </h1>

            <p className="mt-2 text-slate-400">{session.user.email}</p>
          </div>

          <LogoutButton />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "My Orders",
            "My Deliveries",
            "My Payments",
            "My Statement",
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="font-semibold">{item}</h2>
              <p className="mt-2 text-sm text-slate-400">
                Available in the customer module.
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
