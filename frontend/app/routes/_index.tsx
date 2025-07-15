import { db } from "database";
import { pads } from "database/schema";
import { redirect } from "react-router";
import { randomPadName } from "~/lib/random-name";
import { internalServerError } from "~/lib/response";
import { tryCatch } from "~/lib/try-catch";

import { createAccessControl } from "~/services/access-control.server";
import { setUserCookie } from "~/services/cookies.server";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "tinypad" },
    {
      name: "description",
      content: "Yet another smol multiplayer text editor.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const result = await tryCatch(
    db
      .insert(pads)
      .values({ name: randomPadName() })
      .returning({ id: pads.id }),
  );
  if (result.error !== null) {
    throw internalServerError();
  }

  const id = result.data[0].id;
  const ac = await createAccessControl(request);
  return redirect(
    `/${id}`,
    await setUserCookie(ac.getName(), await ac.addPad(id)),
  );
}
