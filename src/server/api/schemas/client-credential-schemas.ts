import { z } from "zod";

// Schemas
export const ClientCredentialsTokenSchema = z
  .object({
    token: z.string().min(1),
    expiresAt: z.date().min(new Date()),
  })
  .refine(
    (data) => {
      if (data.expiresAt < new Date()) {
        return false;
      }
      return true;
    },
    { message: "Expires must be in the future" },
  );

// Interfaces
