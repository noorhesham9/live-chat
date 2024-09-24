import { createContext, useState } from "react";
export const UserContext = createContext({});

export function UsercontextProvider({ children }) {
  const [userName, setUserName] = useState(null);
  const [userID, setUserID] = useState(null);
  const [userToken, setUserToken] = useState(null);
  return (
    <UserContext.Provider
      value={{
        userID,
        setUserID,
        userName,
        setUserName,
        userToken,
        setUserToken,
      }}>
      {children}
    </UserContext.Provider>
  );
}
