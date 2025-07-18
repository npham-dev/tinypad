import { z } from "zod";

export const allowedContentTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

export type AllowedContentType = keyof typeof allowedContentTypes;

export const schema = z.object({
  contentType: z.enum(allowedContentTypes),
});
