import type { Route } from "../+types";

import { db } from "common/database";
import { pads } from "common/database/schema";
import { tryCatch } from "common/lib/try-catch";
import { eq } from "drizzle-orm";
import { notAuthorized, notFound } from "~/lib/response";
import { createAccessControl } from "~/services/access-control.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const result = await tryCatch(
    db
      .select({
        name: pads.name,
        description: pads.description,
        tags: pads.tags,
        password: pads.password,
        public: pads.public,
        iconImage: pads.iconImage,
        coverImage: pads.coverImage,
      })
      .from(pads)
      .where(eq(pads.id, params.id)),
  );
  if (result.error !== null || result.data.length === 0) {
    throw notFound();
  }

  const pad = result.data[0];
  const ac = await createAccessControl(request);
  if (await ac.canManagePad(params.id, pad.public)) {
    // @todo if pad is public, add jwt for it
    // this IS necessary because a user changing a pad to private will kick everyone else
    // unless they have a jwt (unless we should allow that??)

    return {
      name: ac.getName(),
      token: ac.getToken(),
      pad: {
        ...pad,
        tags: pad.tags?.split(",") || [],
        password: !!pad.password,
      },
    };
  }

  // @todo redirect to different page requesting password
  throw notAuthorized();
}
