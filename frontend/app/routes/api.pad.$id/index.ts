import { db } from "common/database";
import { pads } from "common/database/schema";
import { tryCatch } from "common/lib/try-catch";
import { eq } from "drizzle-orm";
import {
  notAuthorized,
  notFound,
  standardResponse,
  StatusCode,
} from "~/lib/response";
import { createAccessControl } from "~/services/access-control.server";
import { logger } from "~/services/logger.server";
import type { Route } from "../api.pad.$id/+types";
import { updatePadSchema } from "./action-schema";

const log = logger.child({ module: "api.pad.$id" });

// why do I use an api route instead of an action w/ intent?
// imo it depends on the primary usage - forms use actions, anything else use api
// possibly not as maintainable if primary usage changes

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method === "POST") {
    const ac = await createAccessControl(request);
    if (!(await ac.canManagePad(params.id))) {
      return notAuthorized();
    }

    const bodyResult = await tryCatch(request.json());
    if (bodyResult.error !== null) {
      return standardResponse({
        message: "Invalid body",
        status: StatusCode.BAD_REQUEST,
      });
    }

    const submissionResult = await tryCatch(
      updatePadSchema.parseAsync(bodyResult.data),
    );
    if (submissionResult.error !== null) {
      return standardResponse({
        message: "Invalid body",
        status: StatusCode.BAD_REQUEST,
      });
    }

    // @todo delete previous icon or cover if provided

    const nextPad = {
      ...submissionResult.data,
      name: submissionResult.data.title,
      tags: fmtTags(submissionResult.data.tags),
    };
    if (isEmpty(nextPad)) {
      return standardResponse({
        message: "Empty submission data, no changes necessary",
      });
    }

    const updateResult = await tryCatch(
      db.update(pads).set(nextPad).where(eq(pads.id, params.id)),
    );
    if (updateResult.error !== null) {
      log.error(updateResult.error);
      return standardResponse({
        message: "Failed to update pad",
        status: StatusCode.INTERNAL_SERVER_ERROR,
      });
    }

    return standardResponse({ message: "Successfully updated pad" });
  }
  throw notFound();
}

/**
 * Is an object empty?
 * Useful for determining if a trip to the db is necessary
 * @param obj
 * @returns
 */
function isEmpty(obj: Record<string, unknown>): boolean {
  return (
    Object.values(obj).filter((value) => typeof value !== "undefined")
      .length === 0
  );
}

function fmtTags(tags: string[] | undefined) {
  if (typeof tags === "undefined") {
    return undefined;
  }

  const trimmedTags = tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 5)
    .join(",");
  return trimmedTags.length === 0 ? null : trimmedTags;
}
