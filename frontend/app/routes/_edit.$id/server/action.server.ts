import type { Route } from "../+types";

import { parseWithZod } from "@conform-to/zod";
import bcrypt from "bcrypt";
import { db } from "common/database";
import { pads } from "common/database/schema";
import { tryCatch } from "common/lib/try-catch";
import { eq } from "drizzle-orm";
import { notFound, standardResponse, StatusCode } from "~/lib/response";
import { updatePadSchema } from "./action-schema";

function hashPassword(password: string | undefined) {
  if (typeof password === "string") {
    return password.length === 0
      ? Promise.resolve(null)
      : bcrypt.hash(password, 10);
  }
  return Promise.resolve(undefined);
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  switch (formData.get("intent")) {
    case "update": {
      const submission = parseWithZod(formData, { schema: updatePadSchema });
      if (submission.status !== "success") {
        return submission.reply();
      }

      const passwordResult = await tryCatch(
        hashPassword(submission.value.password),
      );
      if (passwordResult.error !== null) {
        return standardResponse({
          message: "Failed to hash password",
          status: StatusCode.INTERNAL_SERVER_ERROR,
        });
      }

      // @todo check auth

      const updateResult = await tryCatch(
        db
          .update(pads)
          .set({
            ...submission.value,
            name: submission.value.title,
            password: passwordResult.data,
            public:
              typeof submission.value.privacy === "undefined"
                ? undefined
                : submission.value.privacy === "public",
          })
          .where(eq(pads.id, params.id)),
      );
      if (updateResult.error !== null) {
        return standardResponse({
          message: "Failed to update pad",
          status: StatusCode.INTERNAL_SERVER_ERROR,
        });
      }

      return standardResponse({ message: "Successfully updated pad" });
    }
  }

  throw notFound();
}
