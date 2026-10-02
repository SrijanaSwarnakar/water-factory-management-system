import { requirePermission } from "@/lib/authorization";

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requirePermission("customer-portal:view");

  return <>{children}</>;
}
