// @todo create document & rebuild from snapshot
// I think this shouldn't be in a loader because we really only need one snapshot on the client
// doesn't need to refresh or anything, yjs should handle it

import { tryCatch } from "common/lib/try-catch";
import z from "zod";
import { internalServerError, notAuthorized, notFound } from "~/lib/response";
import { getUserCookie } from "~/services/cookies.server";
import type { Route } from "./+types/api.pad.$id";

const postSchema = z.object({
  delta: z.instanceof(Uint8Array),
});

// @todo update a pad document
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
