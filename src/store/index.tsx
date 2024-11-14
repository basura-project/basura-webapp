"use client";
import { createContext, useState, Dispatch, SetStateAction, useContext, useEffect, ReactNode } from "react";
import { userDetails } from "@/services";

export type User = {
  name: string;
  email: string;
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
  const [user, setUser] = useState<User>({ name: "", email: "" });

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//         try {
//           const details = "";
//           if (details) {
//             setUser({
//               name: details.data.name.firstname,
//               email: details.data.email,
//             });
//           }
//         } catch (error) {
//           console.error("Failed to fetch user details:", error);
//         }
//       };
    
//       fetchUserDetails();
//   }, []); // Empty dependency array to ensure this runs only once on mount

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
