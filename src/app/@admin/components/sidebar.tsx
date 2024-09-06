"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SquareUserRound,
  LineChart,
  FilePlus,
  Building,
  Settings,
  Users2,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Image
            src="/logo-icon.svg"
            width={120}
            height={24}
            alt="Basura Logo"
            className="block dark:hidden"
          />
          <span className="sr-only">Basura</span>
        </Link>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/employees"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
                  pathname == "/employees"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <Users2 className="h-5 w-5" />
                <span className="sr-only">Employees</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Employees</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/properties"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
                  pathname == "/properties"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <Building className="h-5 w-5" />
                <span className="sr-only">Properties</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Properties</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/clients"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
                  pathname == "/clients"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <SquareUserRound className="h-5 w-5" />
                <span className="sr-only">Clients</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Clients</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/garbage-attributes"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
                  pathname == "/garbage-attributes"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <FilePlus className="h-5 w-5" />
                <span className="sr-only">Garbage Attributes</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Garbage Attributes</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/analytics"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
                  pathname == "/analytics"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <LineChart className="h-5 w-5" />
                <span className="sr-only">Analytics</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Analytics</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
