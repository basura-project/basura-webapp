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
  fetchTime: number;
}

// Making the context value optional and handling cases where it's accessed without a provider.
export const UserContext = createContext<UserContextInterface | undefined>(undefined);

type UserProviderProps = {
  children: ReactNode;  
};

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [apiRequestTime, setApiRequestTime] = useState(0); 


  useEffect(() => {

    const fetchUserDetails = async () => {
      const startTime = performance.now();
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
        } finally {
          const endTime = performance.now();
          setApiRequestTime(endTime - startTime); 
        }
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <UserContext.Provider value={{ user: user as User, setUser: setUser as Dispatch<SetStateAction<User>>, fetchTime: apiRequestTime }}>
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
