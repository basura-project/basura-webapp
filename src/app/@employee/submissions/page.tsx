"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreHorizontal, Timer } from "lucide-react";
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
            <BreadcrumbLink href="/submissions">Submissions</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="p-8">
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <p className="text-gray-600">List of submissions</p>
        <Separator className="my-4" />
        <div className="mt-6 shadow-md rounded-md bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Id</TableHead>
                <TableHead>Client Type</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Details</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission, index) => (
                <TableRow key={index}>
                  <TableCell>{submission.date}</TableCell>
                  <TableCell>{submission.id}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      {submission.clientType}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      {submission.clientName}
                    </Button>
                  </TableCell>
                  <TableCell>{submission.details}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => console.log("Edit")}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("Delete")}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">1 of 10 row(s) selected.</p>
        <div className="flex items-center space-x-2">
          <span>Rows per page</span>
          <select className="border rounded-md p-1 text-sm" value={rowsPerPage}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            {"<"}
          </Button>
          <span className="text-sm">{`Page ${currentPage} of 10`}</span>
          <Button variant="ghost" onClick={() => setCurrentPage((p) => p + 1)}>
            {">"}
          </Button>
        </div>
      </div>
      </Card>
    </>
  );
};

export default SubmissionsPage;
