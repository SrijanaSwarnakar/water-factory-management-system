import LogoutButton from "@/components/auth/LogoutButton";
import { requirePermission, type AppRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import {
  toggleUserActive,
  updateUserRole,
} from "@/actions/user-management";

const ROLE_OPTIONS: readonly AppRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "ACCOUNTANT",
  "DELIVERY_STAFF",
  "USER",
  "CUSTOMER",
];

const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  SUPER_ADMIN: "Full system access",
  ADMIN: "Business administration",
  MANAGER: "Operations management",
  ACCOUNTANT: "Finance and ledger",
  DELIVERY_STAFF: "Deliveries, returns and collection",
  USER: "Basic internal access",
  CUSTOMER: "External customer portal",
};

type UsersPageProps = {
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
};

export default async function UsersPage({
  searchParams,
}: UsersPageProps) {
  const session = await requirePermission("users:manage");
  const params = await searchParams;

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      employee: {
        select: {
          id: true,
          name: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const actorRole = session.user.role as AppRole;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">
              Administration
            </p>
            <h1 className="mt-1 text-3xl font-bold">User Management</h1>
            <p className="mt-2 text-slate-400">
              Manage application roles and account activation from the
              server-side control layer.
            </p>
          </div>

          <LogoutButton />
        </header>

        {params.error ? (
          <div className="mt-6 rounded-lg border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-300">
            {params.error}
          </div>
        ) : null}

        {params.updated ? (
          <div className="mt-6 rounded-lg border border-emerald-900/50 bg-emerald-950/40 p-4 text-sm text-emerald-300">
            User changes saved successfully.
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLE_OPTIONS.map((role) => (
            <div
              key={role}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <p className="font-semibold">{role}</p>
              <p className="mt-1 text-sm text-slate-400">
                {ROLE_DESCRIPTIONS[role]}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/70 text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-medium">User</th>
                  <th className="px-5 py-4 font-medium">Role</th>
                  <th className="px-5 py-4 font-medium">Account Link</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {users.map((user) => {
                  const targetRole = user.role as AppRole;
                  const isSelf = user.id === session.user.id;
                  const isProtectedSuperAdmin =
                    targetRole === "SUPER_ADMIN" && actorRole !== "SUPER_ADMIN";

                  return (
                    <tr key={user.id} className="align-top">
                      <td className="px-5 py-5">
                        <p className="font-medium">{user.name}</p>
                        <p className="mt-1 text-slate-400">{user.email}</p>
                      </td>

                      <td className="px-5 py-5">
                        <form action={updateUserRole} className="flex gap-2">
                          <input type="hidden" name="userId" value={user.id} />

                          <select
                            name="role"
                            defaultValue={targetRole}
                            disabled={isSelf || isProtectedSuperAdmin}
                            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Role for ${user.name}`}
                          >
                            {ROLE_OPTIONS.map((role) => {
                              const unavailableToAdmin =
                                actorRole !== "SUPER_ADMIN" &&
                                role === "SUPER_ADMIN";

                              return (
                                <option
                                  key={role}
                                  value={role}
                                  disabled={unavailableToAdmin}
                                >
                                  {role}
                                </option>
                              );
                            })}
                          </select>

                          <button
                            type="submit"
                            disabled={isSelf || isProtectedSuperAdmin}
                            className="rounded-lg bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Save
                          </button>
                        </form>
                      </td>

                      <td className="px-5 py-5 text-slate-300">
                        {user.employee ? (
                          <span>Employee: {user.employee.name}</span>
                        ) : user.customer ? (
                          <span>Customer: {user.customer.name}</span>
                        ) : (
                          <span className="text-slate-500">No business link</span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={
                            user.isActive
                              ? "rounded-full bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-300"
                              : "rounded-full bg-red-950 px-3 py-1 text-xs font-medium text-red-300"
                          }
                        >
                          {user.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <form action={toggleUserActive}>
                          <input type="hidden" name="userId" value={user.id} />

                          <button
                            type="submit"
                            disabled={isSelf || isProtectedSuperAdmin}
                            className="rounded-lg border border-slate-700 px-3 py-2 font-medium text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-4 text-sm text-slate-500">
          User accounts are not hard-deleted. Account history remains
          available, while inactive accounts cannot sign in.
        </p>
      </div>
    </main>
  );
}
