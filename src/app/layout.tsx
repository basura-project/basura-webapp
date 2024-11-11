"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import { userDetails } from "@/services/index";
import Cookies from "js-cookie";
import { Toaster } from "@/components/ui/toaster";
import Loading from "@/components/ui/loading";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  admin,
  employee,
  client,
  auth,
  children,
}: Readonly<{
  admin: React.ReactNode;
  employee: React.ReactNode;
  client: React.ReactNode;
  auth: React.ReactNode;
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loaded, setIsLoaded] = useState<boolean>(false);
  const [defaultRoute, setDefaultRoute] = useState<string>("auth");

  useEffect(() => {
    setDefaultRoute("admin");
    setIsLoaded(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);

    if (Cookies.get("access_token")) {
      (async function () {
        try {
          let res: any = await userDetails();
          setDefaultRoute(res.data.role);
          setIsLoaded(true);
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        } catch (e: any) {
          setIsLoading(false);
          console.log(e);
        }
      })();
    } else {
      setIsLoaded(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      setDefaultRoute("auth");
    }
  }, []);

  function role() {
    switch (defaultRoute) {
      case "admin":
        return admin;
      case "employee":
        return employee;
      case "client":
        return client;
      case "auth":
        return auth;
      default:
        return auth;
    }
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {!isLoading ? role() : <Loading loaded={loaded} />}
        <Toaster />
      </body>
    </html>
  );
}
