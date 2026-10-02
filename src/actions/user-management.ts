"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { AppRole, requirePermission } from "@/lib/authorization";

const VALID_ROLES: readonly AppRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "ACCOUNTANT",
  "DELIVERY_STAFF",
  "USER",
  "CUSTOMER",
];

function redirectWithError(message: string): never {
  redirect(`/users?error=${encodeURIComponent(message)}`);
}

function isAppRole(value: string): value is AppRole {
  return VALID_ROLES.includes(value as AppRole);
}

export async function updateUserRole(formData: FormData) {
  const session = await requirePermission("users:manage");

  const userId = String(formData.get("userId") ?? "");
  const roleValue = String(formData.get("role") ?? "");

  if (!userId || !isAppRole(roleValue)) {
    redirectWithError("Invalid user or role.");
  }

  if (userId === session.user.id) {
    redirectWithError("You cannot change your own role.");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!targetUser) {
    redirectWithError("User not found.");
  }

  const actorRole = session.user.role as AppRole;
  const targetRole = targetUser.role as AppRole;

  if (actorRole !== "SUPER_ADMIN" && targetRole === "SUPER_ADMIN") {
    redirectWithError("Only a SUPER_ADMIN can manage a SUPER_ADMIN.");
  }

  if (actorRole !== "SUPER_ADMIN" && roleValue === "SUPER_ADMIN") {
    redirectWithError("Only a SUPER_ADMIN can assign the SUPER_ADMIN role.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: roleValue as UserRole,
    },
  });

  revalidatePath("/users");
  redirect("/users?updated=role");
}

export async function toggleUserActive(formData: FormData) {
  const session = await requirePermission("users:manage");

  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    redirectWithError("Invalid user.");
  }

  if (userId === session.user.id) {
    redirectWithError("You cannot deactivate your own account.");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      isActive: true,
    },
  });

  if (!targetUser) {
    redirectWithError("User not found.");
  }

  const actorRole = session.user.role as AppRole;
  const targetRole = targetUser.role as AppRole;

  if (actorRole !== "SUPER_ADMIN" && targetRole === "SUPER_ADMIN") {
    redirectWithError("Only a SUPER_ADMIN can manage a SUPER_ADMIN.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: !targetUser.isActive,
    },
  });

  revalidatePath("/users");
  redirect("/users?updated=status");
}
