import { createCookie } from "react-router";
import z from "zod";
import { randomName } from "./lib/random-name";
import { tryCatch } from "./lib/try-catch";

const schema = z.object({
  name: z.string(),
});

const userCookie = createCookie("tinypad.user", {
  httpOnly: true,
  secure: true,
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

export async function randomUserCookie() {
  return {
    headers: {
      "Set-Cookie": await userCookie.serialize({ name: randomName() }),
    },
  };
}
