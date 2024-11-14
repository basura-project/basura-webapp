"use client";
import React from "react";
import Settings from "./components/Settings";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const SubmissionsPage = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const rowsPerPage = 10;

  // Dummy data
  const submissions = Array.from({ length: 10 }, (_, i) => ({
    date: "2023-06-23",
    id: `BS-878${i}`,
    clientType: "Client Type",
    clientName: "Client Name",
    details: "Borough Name, Street Name, Building Number",
  }));

  return (
    <>
      <Breadcrumb className="hidden md:flex -mt-[44px] z-50">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/submissions">Settings</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="p-8">
        <Settings />
      </Card>
    </>
  );
};

export default SubmissionsPage;
