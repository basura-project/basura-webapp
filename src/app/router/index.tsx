"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/store";

import Loading from "@/components/ui/loading";

export const UserRouter = ({
  admin,
  employee,
  client,
  auth,
}: Readonly<{
  admin: React.ReactNode;
  employee: React.ReactNode;
  client: React.ReactNode;
  auth: React.ReactNode;
}>): React.ReactNode => {
  const [defaultRoute, setDefaultRoute] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, fetchTime } = useUser();

  useEffect(() => {

    // Set default route dynamically based on user role
    const handleRoutes = async () => {
      if (user) {
        if (user.role === "admin") {
          setDefaultRoute("admin");
        } else if (user.role === "employee") {
          setDefaultRoute("employee");
        } else if (user.role === "client") {
          setDefaultRoute("client");
        } else {
          setDefaultRoute("auth");
        }
      } else {
        const timeOutId = setTimeout(() => {
          setIsLoading(false);
          setDefaultRoute("auth")
        }, fetchTime + 500);

       return () => clearTimeout(timeOutId);
      
      }
    };

    handleRoutes();

  }, [user, defaultRoute]);

  // Map defaultRoute to the appropriate layout component
  const routeComponents: { [key: string]: React.ReactNode } = {
    admin,
    employee,
    client,
    auth,
  };

  return (
    <>
      {!isLoading ? routeComponents[defaultRoute] : <Loading />}
    </>
  );
};

export default UserRouter;
