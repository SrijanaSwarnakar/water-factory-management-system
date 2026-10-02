import {
  INTERNAL_ROLES,
  requireRole,
} from "@/lib/authorization";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await import("@/lib/authorization").then(({ getCurrentSession }) =>
    getCurrentSession()
  );

  if (!session) {
    redirect("/login");
  }

  const userRole = session.user.role as string | undefined;

  if (userRole === "CUSTOMER") {
    redirect("/customer");
  }

  await requireRole(INTERNAL_ROLES);

  return <>{children}</>;
}
