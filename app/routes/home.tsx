import { db } from "database";
import { pads } from "database/schema";
import { redirect } from "react-router";
import { randomName } from "~/lib/random-name";
import { serverError } from "~/lib/response";
import { tryCatch } from "~/lib/try-catch";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "tinypad" },
    {
      name: "description",
      content: "Yet another smol multiplayer text editor.",
    },
  ];
}

export async function loader() {
  const result = await tryCatch(
    db.insert(pads).values({ name: randomName() }).returning({ id: pads.id }),
  );
  if (result.error !== null) {
    throw serverError();
  }
  return redirect(`/${result.data[0].id}`);
}
