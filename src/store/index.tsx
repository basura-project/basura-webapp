"use client";
import { createContext, useState, Dispatch, SetStateAction, useContext, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

import { userDetails } from "@/services";

export type User = {
  name: string;
  email?: string;
  role: string;
  username: string;
};

export interface UserContextInterface {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
}

// Making the context value optional and handling cases where it's accessed without a provider.
export const UserContext = createContext<UserContextInterface | undefined>(undefined);

type UserProviderProps = {
  children: ReactNode;  
};

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const access_token = Cookies.get('access_token');
      if (access_token) {
        try {
          const res = await userDetails(); // Fetch user details
          if (res) {
            setUser({
              name: res.data.name && res.data.name.firstname + res.data.name.lastname,
              email: res.data.email && res.data.email,
              role: res.data.role,
              username: res.data.username && res.data.username,
            });
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <UserContext.Provider value={{ user: user as User, setUser: setUser as Dispatch<SetStateAction<User>> }}>
      {children}
    </UserContext.Provider>
  );
}


// Custom hook to access the user context, throwing an error if used outside of the provider.
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default UserProvider;
