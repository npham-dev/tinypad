import { omit } from "common/lib/utils";
import { createContext, useContext } from "react";
import { randomName } from "~/lib/random-name";
import { stringToColor } from "~/lib/string-to-color";

// technically unnecessary because useLoaderData exists
// but it is a nicer abstraction

export type User = {
  name: string;
  color: string;
  token: string | null;
};

export type PublicUser = Pick<User, "name" | "color">;

type UserContext = Pick<User, "name" | "token">;
const UserContext = createContext<UserContext>({
  name: randomName(),
  token: null,
});

export function useUser(): User {
  const user = useContext(UserContext);
  return {
    ...user,
    color: stringToColor(user.name),
  };
}

export function publicUser(user: User): PublicUser {
  return omit(user, ["token"]);
}

export const UserContextProvider = ({
  children,
  ...props
}: UserContext & { children: React.ReactNode }) => {
  return <UserContext.Provider value={props}>{children}</UserContext.Provider>;
};
