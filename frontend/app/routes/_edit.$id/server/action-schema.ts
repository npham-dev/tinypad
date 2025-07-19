import { z } from "zod";

// client side validation to update a pad
export const renamePadSchema = z.object({
  // avoid using a name key
  // throws off form handling
  title: z.string({ message: "A pad title is required" }).max(256),
  description: z
    .string()
    .max(500)
    .optional()
    .transform((value) => value ?? ""),
  privacy: z.enum(["public", "private"]),
  password: z.string().max(80).optional(),
});

export const loginSchema = z.object({
  password: z.string({ message: "A password is required" }),
});
