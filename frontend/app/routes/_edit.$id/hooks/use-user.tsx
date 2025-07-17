import { omit } from "common/lib/utils";
import { useLoaderData } from "react-router";
import { stringToColor } from "~/lib/string-to-color";
import type { loader } from "../server/loader.server";

// technically unnecessary because useLoaderData exists
// but it is a nicer abstraction

export type User = {
  name: string;
  color: string;
  token: string | null;
};

export type PublicUser = Pick<User, "name" | "color">;

export function useUser(): User {
  const { name, token } = useLoaderData<typeof loader>();
  return {
    name,
    token,
    color: stringToColor(name),
  };
}

export function publicUser(user: User): PublicUser {
  return omit(user, ["token"]);
}
