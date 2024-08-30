"use client";

import * as React from "react";
import Link from "next/link";

import { getEmployeeDetails } from "@/services/index";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ViewEmployee({ params: { empId } }: any) {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isError, setIsError] = React.useState<string>("");
  const [empDetails, setEmpDetails] = React.useState<any>({});

  React.useEffect(() => {
    (async () => {
      try {
        let res = await getEmployeeDetails(empId);
        if (res.data) {
          setEmpDetails(res.data);
        }
        setIsLoading(false);
        setIsError("");
      } catch (e: any) {
        setIsLoading(false);
        setIsError(e.response.message);
        console.log(e);
      }
    })();
  }, [isLoading]);

  return (
    <div className="grid gap-2">
      <Breadcrumb className="hidden md:flex -mt-[68px] z-50">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/employees">Employees</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>View #{empId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card x-chunk="dashboard-05-chunk-3">
        <div className="hidden space-y-2 p-6 pb-16 md:block">
          <div className="space-y-0.5">
            <h2 className="text-xl font-semibold tracking-tight">
              Employee Details
            </h2>
          </div>
          <Separator className="my-6" />
          {isLoading ? "loading" : ""}
          {!isLoading && isError == "" ? (
            <div className="flex-1 py-2">
              <div className="mb-3">
                <p className="font-medium">Employee Id</p>
                <p className="font-normal">{empDetails.employee_id}</p>
              </div>
              <div className="mb-3">
                <p className="font-medium">First Name</p>
                <p className="font-normal">{empDetails.name.firstname}</p>
              </div>
              <div className="mb-3">
                <p className="font-medium">Middle Name</p>
                <p className="font-normal">{empDetails.name.middlename}</p>
              </div>
              <div className="mb-3">
                <p className="font-medium">Last Name</p>
                <p className="font-normal">{empDetails.name.lastname}</p>
              </div>
              <div className="mb-3">
                <p className="font-medium">Contact</p>
                <p className="font-normal">{empDetails.contact}</p>
              </div>
              <div className="mb-3">
                <p className="font-medium">Email</p>
                <p className="font-normal">{empDetails.email}</p>
              </div>
              <div className="mb-3">
                <p className="font-medium">Bank Account No</p>
                <p className="font-normal">{empDetails.bank_account_no}</p>
              </div>
              <div className="mb-3">
                <p className="font-medium">User Name</p>
                <p className="font-normal">{empDetails.username}</p>
              </div>
              <div className="mb-3">
                <p className="font-medium">Role</p>
                <p className="font-normal">{empDetails.role}</p>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
        {isError !== "" && !isLoading && (
          <p className="text-[0.8rem] font-medium text-destructive">
            {isError}
          </p>
        )}
      </Card>
    </div>
  );
}
