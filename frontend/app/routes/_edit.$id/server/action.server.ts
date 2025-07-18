import type { Route } from "../+types";

import { parseWithZod } from "@conform-to/zod";
import bcrypt from "bcrypt";
import { db } from "common/database";
import { pads } from "common/database/schema";
import { tryCatch } from "common/lib/try-catch";
import { eq } from "drizzle-orm";
import {
  internalServerError,
  notFound,
  standardResponse,
} from "~/lib/response";
import { updatePadSchema } from "../action-schema";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  switch (formData.get("intent")) {
    case "update": {
      const submission = parseWithZod(formData, { schema: updatePadSchema });
      if (submission.status !== "success") {
        return submission.reply();
      }

      const passwordResult = await tryCatch(
        submission.value.password
          ? bcrypt.hash(submission.value.password, 10)
          : Promise.resolve(undefined),
      );
      if (passwordResult.error !== null) {
        // @todo more descriptive errors than just 500 (use standard response + enums)
        throw internalServerError();
      }

      // @todo check auth
      const updateResult = await tryCatch(
        db
          .update(pads)
          .set({
            name: submission.value.title,
            description: submission.value.description,
            password: passwordResult.data,
            public:
              typeof submission.value.privacy === "undefined"
                ? undefined
                : submission.value.privacy === "public",
          })
          .where(eq(pads.id, submission.value.id)),
      );
      if (updateResult.error !== null) {
        throw internalServerError();
      }

      return standardResponse({ message: "Updated pad" });
    }
  }

  throw notFound();
}
