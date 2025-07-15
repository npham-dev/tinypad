import { createContext, useContext } from "react";
import { randomName } from "~/lib/random-name";
import { stringToColor } from "~/lib/string-to-color";
import { omit } from "~/lib/utils";

// technically unnecessary because useLoaderData exists
// but it is a nicer abstraction

export type UserContext = {
  name: string;
  token: string | null;
};

const UserContext = createContext<UserContext>({
  name: randomName(),
  token: null,
});

export function useUser() {
  const user = useContext(UserContext);
  return {
    ...user,
    color: stringToColor(user.name),
  };
}

export function usePublicUser() {
  return omit(useUser(), ["token"]);
}

export const UserContextProvider = ({
  children,
  ...props
}: UserContext & { children: React.ReactNode }) => {
  return <UserContext.Provider value={props}>{children}</UserContext.Provider>;
};
