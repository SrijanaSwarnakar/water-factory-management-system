import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <h1 className="text-3xl font-bold">Access Denied</h1>

        <p className="mt-3 text-slate-400">
          You do not have permission to access this page.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
