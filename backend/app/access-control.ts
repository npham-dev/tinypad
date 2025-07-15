import { parse } from "cookie";
import { type IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { tryCatch } from "./lib/try-catch";

const jwtSchema = z.object({
  pads: z.array(z.string()),
});

export async function getPads(request: IncomingMessage): Promise<string[]> {
  const parsedCookies = request.headers.cookie
    ? parse(request.headers.cookie)
    : {};
  if (!parsedCookies.token) {
    return [];
  }

  const payload = jwt.verify(parsedCookies.token, process.env.JWT_SECRET!);
  const dataResult = await tryCatch(jwtSchema.parseAsync(payload));
  if (dataResult.error !== null) {
    return [];
  }
  return dataResult.data.pads;
}

export async function canJoinRoom(
  pads: string[],
  id: string,
): Promise<boolean> {
  // if pad is public, anyone can join
  const responseResult = await tryCatch(fetch(
    new URL(`/api/pad/${id}`, process.env.FRONTEND_BASE_URL),
  ));
  if(responseResult.error !== null || responseResult.data.status !== 200) {
    return false
  }
  
  const jsonResult = await tryCatch(responseResult.data.json());
  if(jsonResult.error !== null)  {
    return false
  } else if ("public" in jsonResult.data && jsonResult.data["public"]) {
    return true;
  }

  // otherwise, verify jwt
  return pads.includes(id);
}
