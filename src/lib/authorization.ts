import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const APP_ROLES = [
  "ADMIN",
  "MANAGER",
  "ACCOUNTANT",
  "DELIVERY_STAFF",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireAuth() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(
  allowedRoles: readonly AppRole[]
) {
  const session = await requireAuth();

  const userRole = session.user.role as AppRole | undefined;

  if (!userRole || !allowedRoles.includes(userRole)) {
    redirect("/unauthorized");
  }

  return session;
}