import { createContext, useContext } from "react";
import { randomName } from "~/lib/random-name";

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
  return useContext(UserContext);
}

export const UserContextProvider = ({
  children,
  ...props
}: UserContext & { children: React.ReactNode }) => {
  return <UserContext.Provider value={props}>{children}</UserContext.Provider>;
};
