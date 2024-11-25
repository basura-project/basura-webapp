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
  const [defaultRoute, setDefaultRoute] = useState<string>("auth");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useUser();

  useEffect(() => {
    // Set default route dynamically based on user role
    if (user?.role) {
      setDefaultRoute(user.role);
    } else {
      setDefaultRoute("auth");
    }

    // Simulate loading time
    setTimeout(() => setIsLoading(false), 500);
  }, [user]);

  // Map defaultRoute to the appropriate layout component
  const routeComponents: { [key: string]: React.ReactNode } = {
    admin,
    employee,
    client,
    auth,
  };

  return (
    <>
      {!isLoading ? routeComponents[defaultRoute] || auth : <Loading />}
    </>
  );
};

export default UserRouter;
