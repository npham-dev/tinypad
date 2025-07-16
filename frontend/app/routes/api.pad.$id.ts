import { eq } from "drizzle-orm";
import { notFound } from "~/lib/response";
import { tryCatch } from "~/lib/try-catch";
import { db } from "../../../common/database";
import { pads } from "../../../common/database/schema";
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
