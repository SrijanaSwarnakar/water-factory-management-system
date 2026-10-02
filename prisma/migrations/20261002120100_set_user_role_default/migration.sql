-- Use USER as the default application role for newly created accounts.
ALTER TABLE "user"
ALTER COLUMN "role" SET DEFAULT 'USER';
