import LogoutButton from "@/components/auth/LogoutButton";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Water Factory Management System
            </h1>

            <p className="mt-2 text-slate-400">
              Dashboard
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Today's Sales</p>
            <p className="mt-2 text-2xl font-bold">Rs. 0</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Today's Collection</p>
            <p className="mt-2 text-2xl font-bold">Rs. 0</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Outstanding Credit</p>
            <p className="mt-2 text-2xl font-bold">Rs. 0</p>
          </div>
        </div>
      </div>
    </main>
  );
}