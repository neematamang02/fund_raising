import React, { createContext, useState } from "react";

export const UserRoleContext = createContext({
  role: "donor",
  setRole: () => {},
});

export function UserRoleProvider({ children }) {
  const [role, setRole] = useState("donor");
  return (
    <UserRoleContext.Provider value={{ role, setRole }}>
      {children}
    </UserRoleContext.Provider>
  );
}
