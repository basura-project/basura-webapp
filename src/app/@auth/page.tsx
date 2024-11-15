"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { UserAuthForm } from "./user-auth-form";

export default function AuthenticationPage() {
  return (
    <>
      <div className="container relative hidden h-[100vh] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/examples/authentication"
          className={cn("absolute right-4 top-4 md:right-8 md:top-8")}
        >
          Support
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image
              src="/logo-white.svg"
              width={120}
              height={24}
              alt="Basura Logo"
              className="block dark:hidden"
            />
          </div>
          <div className="relative z-20 mt-auto">
            <p className="text-sm font-normal">
              “At Basura, we are revolutionizing waste management with precision
              segregation, comprehensive data analytics, and artificial
              intelligence.” - Joel Abreu
            </p>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-medium tracking-tight">
                Sign In to your Account
              </h1>
            </div>
            <UserAuthForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
