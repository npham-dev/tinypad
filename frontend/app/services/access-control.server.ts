import jwt from "jsonwebtoken";
import z from "zod";

const jwtSchema = z.object({
  pads: z.array(z.string()),
});

// @todo a more robust solution would probably be to
// store an anon user id in the jwt
// store allowed documents in redis (id -> documents)

export async function canManagePad(token: string, id: string) {
  const pads = await getPadsFromToken(token);
  return pads.includes(id);
}

export async function getPadsFromToken(token: string | undefined) {
  if (!token) {
    return [];
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET!);
  const data = await jwtSchema.parseAsync(payload);
  return data.pads;
}

export function addPadToToken(pads: string[], id: string) {
  let mergedPads = [...pads];
  if (!pads.includes(id)) {
    mergedPads.push(id);
  }
  if (mergedPads.length > 10) {
    mergedPads.shift();
  }

  return jwt.sign(
    { pads: mergedPads } satisfies z.infer<typeof jwtSchema>,
    process.env.JWT_SECRET!,
    { expiresIn: "7 days" },
  );
}
