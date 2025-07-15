import { createCookie } from "react-router";
import z from "zod";
import { tryCatch } from "../lib/try-catch";

const schema = z.object({
  name: z.string(),
  token: z.string().optional(),
});

export type UserCookie = z.infer<typeof schema>;

export const userCookie = createCookie("tinypad.user", {
  httpOnly: true,
  secure: true,
  secrets: [process.env.COOKIE_SECRET!],
  maxAge: 604_800, // one week
});

export async function getUserCookie(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = await userCookie.parse(cookieHeader);
  const parseResult = await tryCatch(schema.parseAsync(cookie));
  if (parseResult.error !== null) {
    return null;
  }
  return parseResult.data;
}

export async function setUserCookie(name: string, token: string) {
  return {
    headers: {
      "Set-Cookie": await userCookie.serialize({
        name,
        token,
      }),
    },
  };
}
