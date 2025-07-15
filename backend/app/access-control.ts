import { type IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { tryCatch } from "./lib/try-catch";

const jwtSchema = z.object({
  pads: z.array(z.string()),
});

function jwtVerify(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(decoded);
    });
  });
}

export async function getPads(request: IncomingMessage): Promise<string[]> {
  if (!request.url) {
    return [];
  }

  const token = new URL(request.url, `http://localhost`).searchParams.get(
    "token",
  );
  if (!token) {
    return [];
  }

  const payloadResult = await tryCatch(jwtVerify(token));
  if (payloadResult.error !== null) {
    return [];
  }

  const dataResult = await tryCatch(jwtSchema.parseAsync(payloadResult.data));
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
  // if we get anything other than 200 then assume we can't join the room
  const responseResult = await tryCatch(
    fetch(new URL(`/api/pad/${id}`, process.env.FRONTEND_BASE_URL)),
  );
  if (responseResult.error !== null || responseResult.data.status !== 200) {
    return false;
  }

  const jsonResult = await tryCatch(responseResult.data.json());
  if (jsonResult.error !== null) {
    return false;
  } else if ("public" in jsonResult.data && jsonResult.data["public"]) {
    return true;
  }

  // otherwise, verify jwt
  return pads.includes(id);
}
