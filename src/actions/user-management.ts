"use server";

import { hashPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  AppRole,
  INTERNAL_ROLES,
  requirePermission,
} from "@/lib/authorization";

const MANAGEABLE_ROLES: readonly AppRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "ACCOUNTANT",
  "DELIVERY_STAFF",
  "USER",
];

function redirectWithError(message: string): never {
  redirect(`/users?error=${encodeURIComponent(message)}`);
}

function isManageableRole(value: string): value is AppRole {
  return (MANAGEABLE_ROLES as readonly string[]).includes(value);
}

export async function createInternalUser(formData: FormData) {
  const session = await requirePermission("users:manage");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const roleValue = String(formData.get("role") ?? "USER");

  if (name.length < 2 || name.length > 100) {
    redirectWithError("Name must contain 2 to 100 characters.");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirectWithError("Enter a valid email address.");
  }

  if (password.length < 8 || password.length > 128) {
    redirectWithError("Password must contain 8 to 128 characters.");
  }

  if (!isManageableRole(roleValue)) {
    redirectWithError("Invalid user role.");
  }

  const actorRole = session.user.role as AppRole;

  if (roleValue === "SUPER_ADMIN" && actorRole !== "SUPER_ADMIN") {
    redirectWithError("Only a SUPER_ADMIN can create a SUPER_ADMIN.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    redirectWithError("A user with this email already exists.");
  }

  const passwordHash = await hashPassword(password);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          emailVerified: false,
          role: roleValue as UserRole,
          isActive: true,
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: passwordHash,
        },
      });
    });
  } catch {
    redirectWithError("Unable to create the user. Please verify the email and try again.");
  }

  revalidatePath("/users");
  redirect("/users?updated=created");
}

export async function updateUserRole(formData: FormData) {
  const session = await requirePermission("users:manage");

  const userId = String(formData.get("userId") ?? "");
  const roleValue = String(formData.get("role") ?? "");

  if (!userId || !isManageableRole(roleValue)) {
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
      customer: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!targetUser) {
    redirectWithError("User not found.");
  }

  if (targetUser.role === "CUSTOMER") {
    redirectWithError("Customer roles are managed from the customer module.");
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

export { INTERNAL_ROLES };
