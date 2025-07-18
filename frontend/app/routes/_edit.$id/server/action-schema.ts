import { z } from "zod";

// client side validation to update a pad
export const renamePadSchema = z.object({
  // avoid using a name key
  // throws off form handling
  title: z.string({ message: "A pad title is required" }).max(256),
  description: z.string().max(500).optional(),
  privacy: z.enum(["public", "private"]).optional(),
  password: z.string().max(80).optional(),
});

// generalized schema to update any key of a pad
export const updatePadSchema = z.object({
  title: z.string().max(256).optional(),
  description: z.string().max(500).optional(),
  privacy: z.enum(["public", "private"]).optional(),
  password: z.string().max(80).optional(),
  tags: z.string().optional(),
  coverImage: z.string().optional(),
  iconImage: z.string().optional(),
});
