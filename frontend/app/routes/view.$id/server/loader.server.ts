import { db } from "common/database";
import { pads } from "common/database/schema/index";
import { tryCatch } from "common/lib/try-catch";
import { eq } from "drizzle-orm";
import { internalServerError, notFound } from "~/lib/response";
import type { Route } from "../+types";

export async function loader({ params }: Route.LoaderArgs) {
  const selectResult = await tryCatch(
    db
      .select({
        content: pads.publishedContent,
        iconImage: pads.iconImage,
        coverImage: pads.coverImage,
        tags: pads.tags,
        name: pads.name,
        description: pads.description,
      })
      .from(pads)
      .where(eq(pads.publishedSlug, params.id)),
  );
  if (selectResult.error !== null) {
    return internalServerError();
  } else if (selectResult.data.length === 0) {
    return notFound();
  }

  return selectResult.data[0];
}
