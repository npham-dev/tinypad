import { z } from "zod";

export const renameSchema = z.object({
  id: z.string({ message: "A pad id is required" }),
  title: z.string({ message: "A name is required" }).max(256),
  description: z.string().max(1000).optional(),
  privacy: z.enum(["public", "private"]).optional(),
  password: z.string().max(80).optional(),
});
