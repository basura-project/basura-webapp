"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ellipsis, PencilLine, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Icons } from "@/components/ui/icons";

// First, let's properly type the interface
interface GarbageAttributes {
  [key: string]: number;  // For dynamic properties
}

interface Submission {
  id: string;
  clientId: string;
  client_type: string;
  client_name: string;
  borough_name: string;
  street_name: string;
  chute_present: boolean;
  timestamp: string;  // ISO 8601 format
  garbage_attributes: GarbageAttributes;
  created_by: string;
}

import  { getGarbageSubmissions } from "@/services"

export default function SubmissionsList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(100);
  const [sortField, setSortField] = useState<"timestamp" | "id">("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getGarbageSubmissions(currentPage, rowsPerPage);
      setSubmissions(data);
    };
    fetchData();
  }, [currentPage, rowsPerPage]);

  const handleSort = (field: "timestamp" | "id") => {
    const order = sortField === field && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(order);
    const sortedData = [...submissions].sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];
      if (order === "asc") {
        return valueA > valueB ? 1 : -1;
      }
      return valueA < valueB ? 1 : -1;
    });
    setSubmissions(sortedData);
  };

  return (
    <div className="space-y-2">
      <div className="text-2xl font-bold">Submissions</div>
      <div className="text-md text-gray-800 pt-0">List of submissions</div>

      <Separator className="my-4" />

      <Card className="p-4">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead onClick={() => handleSort("timestamp")} className="flex items-center cursor-pointer">
                Date {sortField === "timestamp" ? (sortOrder === "asc" ? <ChevronUp size={15} /> : <ChevronDown size={15} />) : ""}
                </TableHead>
                {/* <TableHead onClick={() => handleSort("id")} className="cursor-pointer">
                Id {sortField === "id" ? (sortOrder === "asc" ? <ChevronUp /> : <ChevronDown/>) : ""}
                </TableHead> */}
                <TableHead>Client Type</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Action</TableHead>
            </TableRow>
            </TableHeader>

            <TableBody>
            {submissions.map((submission) => (
                <TableRow key={submission.id}>
                <TableCell>{submission.timestamp}</TableCell>
                {/* <TableCell>{submission.id}</TableCell> */}
                <TableCell><Button variant="outline" size="sm">{submission.client_type}</Button></TableCell>
                <TableCell><Button variant="outline" size="sm">{submission.client_name}</Button></TableCell>
                <TableCell>{submission.borough_name}, {submission.street_name}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                        <Ellipsis size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-24">
                        <DropdownMenuItem className="flex items-center gap-2">
                        <PencilLine size={16} /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                        <Trash2 size={16} /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-gray-500">
          {`1 of ${Math.ceil(totalItems / rowsPerPage)} selected`}
        </div>
        <div className="flex items-center space-x-2">
          <span>Rows per page</span>
          <select
            className="p-2 border border-gray-300 rounded"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>{`Page ${currentPage} of ${Math.ceil(totalItems / rowsPerPage)}`}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(totalItems / rowsPerPage)))
            }
            disabled={currentPage === Math.ceil(totalItems / rowsPerPage)}
          >
            {">"}
          </Button>
        </div>
      </div>
    </div>
  );
}
