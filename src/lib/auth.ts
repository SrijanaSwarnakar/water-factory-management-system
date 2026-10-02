import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  appName: "Water Factory Management System",

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  advanced: {
    database: {
      joins: true,
    },
  },

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  user: {
    additionalFields: {
      role: {
        type: [
          "SUPER_ADMIN",
          "ADMIN",
          "MANAGER",
          "ACCOUNTANT",
          "DELIVERY_STAFF",
          "USER",
          "CUSTOMER",
        ],
        required: false,
        defaultValue: "USER",
        input: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },
});