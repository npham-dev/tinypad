import type { Route } from "../+types";

import {
  unstable_coerceFormValue as coerceFormValue,
  parseWithZod,
} from "@conform-to/zod";
import bcrypt from "bcrypt";
import { db } from "common/database";
import { pads } from "common/database/schema";
import { tryCatch } from "common/lib/try-catch";
import { eq } from "drizzle-orm";
import { notFound, standardResponse, StatusCode } from "~/lib/response";
import { createAccessControl } from "~/services/access-control.server";
import { logger } from "~/services/logger.server";
import { renamePadSchema } from "./action-schema";

const log = logger.child({ module: "_edit.$id" });

export async function action({ request, params }: Route.ActionArgs) {
  const ac = await createAccessControl(request);
  if (!(await ac.canManagePad(params.id))) {
    return standardResponse({
      message: "Unauthorized",
      status: StatusCode.UNAUTHORIZED,
    });
  }

  const formData = await request.formData();
  switch (formData.get("intent")) {
    // I'm thinking actions should have an intent based on where they are used, not on what they do
    // similar to Next.js actions?
    case "rename_popover": {
      const submission = parseWithZod(formData, {
        schema: coerceFormValue(renamePadSchema, {
          defaultCoercion: {
            string(value) {
              // https://conform.guide/api/zod/coerceFormValue
              // empty string values are meaningful here
              if (typeof value !== "string") {
                return value;
              }
              return value.trim();
            },
          },
        }),
        disableAutoCoercion: true,
      });
      if (submission.status !== "success") {
        return standardResponse({
          message: "Invalid form data",
          status: StatusCode.BAD_REQUEST,
        });
      }

      const passwordResult = await tryCatch(
        hashPassword(submission.value.password),
      );
      if (passwordResult.error !== null) {
        log.error(passwordResult.error);
        return standardResponse({
          message: "Failed to hash password",
          status: StatusCode.INTERNAL_SERVER_ERROR,
        });
      }

      const updateResult = await tryCatch(
        db
          .update(pads)
          .set({
            name: submission.value.title,
            description: submission.value.description,
            public: submission.value.privacy === "public",
            password: passwordResult.data,
          })
          .where(eq(pads.id, params.id)),
      );
      if (updateResult.error !== null) {
        log.error(updateResult.error);
        return standardResponse({
          message: "Failed to name pad",
          status: StatusCode.INTERNAL_SERVER_ERROR,
        });
      }

      return standardResponse({ message: "Successfully updated pad" });
    }
  }

  throw notFound();
}

function hashPassword(password: string | undefined) {
  if (!password) {
    return Promise.resolve(undefined);
  }
  const fmtPassword = password.trim();
  return fmtPassword.length === 0
    ? Promise.resolve(undefined)
    : bcrypt.hash(fmtPassword, 10);
}
