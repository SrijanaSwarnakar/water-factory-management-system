-- Add new application roles.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'USER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CUSTOMER';

-- Link an optional login account to a customer business record.
ALTER TABLE "Customer" ADD COLUMN "userId" TEXT;

-- A login account can belong to at most one customer record.
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- Preserve the customer record if its login account is removed.
ALTER TABLE "Customer"
ADD CONSTRAINT "Customer_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
