import {
  INTERNAL_ROLES,
  requireRole,
} from "@/lib/authorization";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole(INTERNAL_ROLES);

  return <>{children}</>;
}
