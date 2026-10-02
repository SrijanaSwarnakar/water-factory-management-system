import { requirePermission } from "@/lib/authorization";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requirePermission("dashboard:view");

  return <>{children}</>;
}
