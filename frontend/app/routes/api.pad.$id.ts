import { db } from "database";
import { pads } from "database/schema";
import { eq } from "drizzle-orm";
import z from "zod";
import { internalServerError, notAuthorized, notFound } from "~/lib/response";
import { tryCatch } from "~/lib/try-catch";
import { getUserCookie } from "~/services/cookies.server";
import type { Route } from "./+types/api.pad.$id";

// get public facing info about any pad
// basically just the name, description, and if it is public
export async function loader({ params }: Route.ActionArgs) {
  const result = await tryCatch(
    db
      .select({
        name: pads.name,
        description: pads.description,
        public: pads.public,
      })
      .from(pads)
      .where(eq(pads.id, params.id)),
  );

  if (result.error !== null || result.data.length === 0) {
    throw notFound();
  }

  return result.data[0];
}

const postSchema = z.object({
  delta: z.instanceof(Uint8Array),
});

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method === "POST") {
    const bodyResult = await tryCatch(request.json());
    if (bodyResult.error !== null) {
      throw internalServerError();
    }

    const token = (await getUserCookie(request))?.token;
    if (!token) {
      throw notAuthorized();
    }

    return;
  }

  throw notFound();
}
