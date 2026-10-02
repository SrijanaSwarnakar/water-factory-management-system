import {
  CUSTOMER_ROLES,
  requireRole,
} from "@/lib/authorization";

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole(CUSTOMER_ROLES);

  return <>{children}</>;
}
