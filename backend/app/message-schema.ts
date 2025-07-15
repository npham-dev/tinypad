import { z } from "zod";

export enum MesssageType {
  SUBSCRIBE = "subscribe",
  UNSUBSCRIBE = "unsubscribe",
  PUBLISH = "publish",
  PING = "ping",
}

export const messageSchema = z.discriminatedUnion("type", [
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
  if (typeof message === "string" || message instanceof Buffer) {
    message = JSON.parse(message.toString());
  }

  return messageSchema.parseAsync(message);
}
