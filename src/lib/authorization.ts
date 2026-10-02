import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const APP_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "ACCOUNTANT",
  "DELIVERY_STAFF",
  "USER",
  "CUSTOMER",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const INTERNAL_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "ACCOUNTANT",
  "DELIVERY_STAFF",
  "USER",
] as const satisfies readonly AppRole[];

export const CUSTOMER_ROLES = [
  "CUSTOMER",
] as const satisfies readonly AppRole[];

export const PERMISSIONS = [
  "dashboard:view",
  "products:view",
  "products:manage",
  "customers:view",
  "customers:manage",
  "employees:view",
  "employees:manage",
  "orders:view",
  "orders:manage",
  "deliveries:view",
  "deliveries:manage",
  "returns:view",
  "returns:manage",
  "inventory:view",
  "inventory:manage",
  "payments:view",
  "payments:manage",
  "receipts:view",
  "ledger:view",
  "ledger:manage",
  "expenses:view",
  "expenses:manage",
  "reports:view",
  "users:manage",
  "customer-portal:view",
  "profile:view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL_PERMISSIONS = ["*"] as const;

const ROLE_PERMISSIONS: Record<
  AppRole,
  readonly (Permission | (typeof ALL_PERMISSIONS)[number])[]
> = {
  SUPER_ADMIN: ALL_PERMISSIONS,

  ADMIN: [
    "dashboard:view",
    "products:view",
    "products:manage",
    "customers:view",
    "customers:manage",
    "employees:view",
    "employees:manage",
    "orders:view",
    "orders:manage",
    "deliveries:view",
    "deliveries:manage",
    "returns:view",
    "returns:manage",
    "inventory:view",
    "inventory:manage",
    "payments:view",
    "payments:manage",
    "receipts:view",
    "ledger:view",
    "ledger:manage",
    "expenses:view",
    "expenses:manage",
    "reports:view",
    "users:manage",
  ],

  MANAGER: [
    "dashboard:view",
    "products:view",
    "products:manage",
    "customers:view",
    "customers:manage",
    "employees:view",
    "orders:view",
    "orders:manage",
    "deliveries:view",
    "deliveries:manage",
    "returns:view",
    "returns:manage",
    "inventory:view",
    "inventory:manage",
    "payments:view",
    "receipts:view",
    "ledger:view",
    "reports:view",
  ],

  ACCOUNTANT: [
    "dashboard:view",
    "customers:view",
    "deliveries:view",
    "payments:view",
    "payments:manage",
    "receipts:view",
    "ledger:view",
    "ledger:manage",
    "expenses:view",
    "expenses:manage",
    "reports:view",
  ],

  DELIVERY_STAFF: [
    "dashboard:view",
    "customers:view",
    "deliveries:view",
    "deliveries:manage",
    "returns:view",
    "returns:manage",
    "payments:view",
    "payments:manage",
    "profile:view",
  ],

  USER: [
    "dashboard:view",
    "profile:view",
  ],

  CUSTOMER: [
    "customer-portal:view",
    "profile:view",
  ],
};

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

  if (session.user.isActive === false) {
    redirect("/login?error=account-inactive");
  }

  return session;
}

export async function requireRole(
  allowedRoles: readonly AppRole[],
) {
  const session = await requireAuth();

  const userRole = session.user.role as AppRole | undefined;

  if (!userRole || !allowedRoles.includes(userRole)) {
    redirect("/unauthorized");
  }

  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireAuth();

  const userRole = session.user.role as AppRole | undefined;

  if (!userRole) {
    redirect("/unauthorized");
  }

  const permissions = ROLE_PERMISSIONS[userRole];

  if (!permissions) {
    redirect("/unauthorized");
  }

  const hasAccess =
    permissions.includes("*") || permissions.includes(permission);

  if (!hasAccess) {
    redirect("/unauthorized");
  }

  return session;
}
