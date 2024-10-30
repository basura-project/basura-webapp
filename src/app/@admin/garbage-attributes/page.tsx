// import NewEmployeeForm from "./new-employee-form";
import GarbageAttributeList from "./garbage-attribute-list";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { View, PencilLine, Trash2, Ellipsis } from "lucide-react";

import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Page() {
  return (
    <>
      <Breadcrumb className="hidden md:flex -mt-[44px] z-50">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/employees">Garbage Attributes</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="container">
        <Card x-chunk="dashboard-05-chunk-3">
            <div className="hidden space-y-2 p-6 md:block">
              <div className="space-y-0.5">
                <h2 className="text-xl font-semibold tracking-tight">
                  Manage Garbage Attributes
                </h2>
              </div>
              <Separator className="my-6" />
              <GarbageAttributeList />
            </div>
        </Card>
      </div>
    </>
  );
}
