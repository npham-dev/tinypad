import { z } from "zod";

export enum MesssageType {
  SUBSCRIBE = "subscribe",
  UNSUBSCRIBE = "unsubscribe",
  PUBLISH = "publish",
  PING = "ping",
}

export const messageSchema = z.discriminatedUnion("message", [
  z.object({
    type: z.literal(MesssageType.SUBSCRIBE),
    topics: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal(MesssageType.UNSUBSCRIBE),
    topics: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal(MesssageType.PUBLISH),
    topic: z.string(),
    clients: z.number().optional(),
  }),
  z.object({
    type: z.literal(MesssageType.PING),
  }),
]);

export async function parseMessage(message: unknown) {
  if (typeof message === "string") {
    message = JSON.parse(String(message));
  }

  return messageSchema.parseAsync(message);
}
