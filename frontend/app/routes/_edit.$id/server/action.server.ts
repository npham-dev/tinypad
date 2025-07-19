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
import { data, redirect } from "react-router";
import { notFound, standardResponse, StatusCode } from "~/lib/response";
import { createAccessControl } from "~/services/access-control.server";
import { setUserCookie } from "~/services/cookies.server";
import { logger } from "~/services/logger.server";
import { loginSchema, renamePadSchema } from "./action-schema";

const log = logger.child({ module: "_edit.$id" });

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  switch (formData.get("intent")) {
    case "login": {
      const submission = parseWithZod(formData, { schema: loginSchema });
      if (submission.status !== "success") {
        return submission.reply();
      }

      const selectResult = await tryCatch(
        db
          .select({ password: pads.password })
          .from(pads)
          .where(eq(pads.id, params.id)),
      );
      if (selectResult.error !== null || selectResult.data.length === 0) {
        return submission.reply({
          formErrors: ["Failed to get pad"],
        });
      }

      const password = selectResult.data[0].password;
      const compareResult = await tryCatch(
        password === null
          ? true
          : bcrypt.compare(submission.value.password, password),
      );
      if (compareResult.error !== null) {
        return submission.reply({
          formErrors: ["Failed to compare passwords"],
        });
      }

      if (compareResult.data) {
        const ac = await createAccessControl(request);
        return redirect(
          `/${params.id}`,
          await setUserCookie(ac.getName(), await ac.addPad(params.id)),
        );
      }

      return data(
        submission.reply({
          formErrors: ["Invalid password"],
        }),
      );
    }

    // I'm thinking actions should have an intent based on where they are used, not on what they do
    // similar to Next.js actions?
    case "rename_popover": {
      const ac = await createAccessControl(request);
      if (!(await ac.canManagePad(params.id))) {
        return standardResponse({
          message: "Unauthorized",
          status: StatusCode.UNAUTHORIZED,
        });
      }

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
