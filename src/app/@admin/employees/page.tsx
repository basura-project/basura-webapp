import NewEmployeeForm from "./new-employee-form";
import EmployeesList from "./employees-list";

import { Card } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <BreadcrumbLink href="/employees">Employees</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Tabs defaultValue="manageEmployee">
        <div className="flex items-center !mb-4">
          <TabsList>
            <TabsTrigger value="manageEmployee">Manage Employees</TabsTrigger>
            <TabsTrigger value="addNewEmployee">Add New Employee</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="manageEmployee">
          <Card x-chunk="dashboard-05-chunk-3">
            <div className="hidden space-y-2 p-6 pb-8 md:block">
              <div className="space-y-0.5">
                <h2 className="text-xl font-semibold tracking-tight">
                  Manage Employees
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage & Update Employee details
                </p>
              </div>
              <Separator className="my-6" />
              <div className="flex-1 ">
                <EmployeesList />
              </div>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="addNewEmployee">
          <Card x-chunk="dashboard-05-chunk-3">
            <div className="hidden space-y-2 p-6 pb-8 md:block">
              <div className="space-y-0.5">
                <h2 className="text-xl font-semibold tracking-tight">
                  Add New Employee
                </h2>
                <p className="text-sm text-muted-foreground">
                  Verify all the details before submission.
                </p>
              </div>
              <Separator className="my-6" />
              <div className="flex-1 lg:max-w-sm">
                <NewEmployeeForm />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
