"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import { userDetails } from "@/services/index";
import Cookies from "js-cookie";
import { Toaster } from "@/components/ui/toaster";

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
  const [defaultRoute, setDefaultRoute] = useState<string>("auth");

  useEffect(() => {
    if (Cookies.get("access_token")) {
      (async function () {
        try {
          let res: any = await userDetails();
          setDefaultRoute(res.data.role);
          setIsLoading(false);
        } catch (e: any) {
          console.log(e);
        }
      })();
    } else {
      setIsLoading(false);
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
        {!isLoading ? role() : ""}
        <Toaster />
      </body>
    </html>
  );
}
