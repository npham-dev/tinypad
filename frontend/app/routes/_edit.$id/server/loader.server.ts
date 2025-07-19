import type { Route } from "../+types";

import { db } from "common/database";
import { pads } from "common/database/schema";
import { tryCatch } from "common/lib/try-catch";
import { eq } from "drizzle-orm";
import { data } from "react-router";
import { notFound } from "~/lib/response";
import { createAccessControl } from "~/services/access-control.server";
import { setUserCookie } from "~/services/cookies.server";

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
        publishedSlug: pads.publishedSlug,
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
    return data(
      {
        authorized: true,
        name: ac.getName(),
        token: ac.getToken(),
        pad: {
          ...pad,
          tags: pad.tags?.split(",") || [],
          password: !!pad.password,
        },
      },
      await setUserCookie(ac.getName(), await ac.addPad(params.id)),
    );
  }

  return {
    authorized: false,
    name: "Unauthorized",
    token: "",
    pad: {
      name: "",
      description: "",
      public: true,
      iconImage: null,
      coverImage: null,
      publishedSlug: "",
      tags: [],
      password: true,
    },
  };
}
