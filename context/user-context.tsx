import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextProps {
  user: unknown;
  setUser: (user: unknown) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context)
    throw new Error('useUserContext must be used within UserProvider');
  return context;
}
