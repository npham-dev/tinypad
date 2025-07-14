import { redirect, type LoaderFunction } from "react-router";
import type { Route } from "./+types/home";
import { v4 as uuidv4 } from "uuid";
import { db } from "database";
import { pads } from "database/schema";
import { randomName } from "~/lib/random-name";
import { tryCatch } from "~/lib/try-catch";

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
    db
      .insert(pads)
      .values({
        name: randomName(),
        body: "",
      })
      .returning({ id: pads.id }),
  );
  if (result.error !== null) {
    throw new Response("Failed to create pad", {
      status: 500,
      statusText: "Failed to create pad",
    });
  }
  return redirect(`/${result.data[0].id}`);
}
