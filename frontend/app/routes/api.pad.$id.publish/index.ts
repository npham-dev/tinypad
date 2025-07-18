import { db } from "common/database";
import { pads } from "common/database/schema/index";
import { tryCatch } from "common/lib/try-catch";
import { eq } from "drizzle-orm";
import z from "zod";
import {
  internalServerError,
  notAuthorized,
  notFound,
  standardResponse,
} from "~/lib/response";
import {
  AccessControl,
  createAccessControl,
} from "~/services/access-control.server";
import type { Route } from "../api.pad.$id.publish/+types";

// @audit should we render entirely server side?
// https://tiptap.dev/docs/editor/api/utilities/html

const schema = z.object({
  content: z.string(),
});

export async function action({ request, params }: Route.ActionArgs) {
  const ac = await createAccessControl(request);
  const result = await AccessControl.isPublic(params.id);
  if (result.error !== null || result.data.length === 0) {
    return notFound();
  }
  if (!(await ac.canManagePad(params.id, result.data[0].public))) {
    return notAuthorized();
  }

  const bodyResult = await tryCatch(request.json().then(schema.parseAsync));
  if (bodyResult.error !== null) {
    return internalServerError();
  }

  const updateResult = await tryCatch(
    db
      .update(pads)
      .set({ publishedContent: bodyResult.data.content })
      .where(eq(pads.id, params.id)),
  );
  if (updateResult.error !== null) {
    return internalServerError();
  }

  return standardResponse({
    message: "Successfully published pad.",
  });
}
