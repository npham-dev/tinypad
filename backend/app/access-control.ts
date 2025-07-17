import "dotenv/config";
import jwt from "jsonwebtoken";
import { db } from "common/database";
import { pads } from "common/database/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { tryCatch } from "common/lib/try-catch";

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

async function getPads(token: string): Promise<string[]> {
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

export async function canJoinRoom(token: string, id: string): Promise<boolean> {
  // if pad is public, anyone can join
  const responseResult = await tryCatch(
    db.select({ public: pads.public }).from(pads).where(eq(pads.id, id)),
  );
  if (responseResult.error !== null || responseResult.data.length === 0) {
    return false;
  } else if (responseResult.data[0].public) {
    return true;
  }

  // otherwise, verify jwt
  return (await getPads(token)).includes(id);
}
