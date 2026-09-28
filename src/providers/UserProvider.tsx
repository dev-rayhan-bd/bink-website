"use client";

import * as React from "react";
import type { CurrentUser } from "@/lib/types/user.type";

type UserContextType = {
  user: CurrentUser | null;
};

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  user,
  children,
}: {
  user: CurrentUser | null;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

export function useUserContext() {
  const context = React.useContext(UserContext);
  return context ?? { user: null };
}
