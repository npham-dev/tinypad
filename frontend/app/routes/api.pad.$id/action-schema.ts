import { z } from "zod";

// generalized schema to update any key of a pad
export const updatePadSchema = z.object({
  title: z.string().max(256).optional(),
  description: z.string().max(500).optional(),
  tags: z
    .array(z.string())
    .max(5, { message: "A pad can only have up to 5 tags." })
    .optional(),
  coverImage: z.string().optional().nullable(),
  iconImage: z.string().optional().nullable(),
});
