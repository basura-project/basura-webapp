"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { getEmployees } from "@/services/index";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { View, PencilLine, Trash2, Ellipsis } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function EmployeesList({
  className,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { toast } = useToast();

  let empData: any = [
    {
      employee_id: "EMP12345",
      name: {
        firstname: "John",
        middlename: "M",
        lastname: "Doe",
      },
      contact: "+1234567890",
      email: "john.doe@example.com",
      username: "john_doe",
      bank_account_no: "1234567890123456",
      password: "password123",
      id_proof: "Base64 encoded file data",
      profile_photo: "Base64 encoded file data",
      role: "employee",
    },
    {
      employee_id: "EMP12346",
      name: {
        firstname: "John",
        middlename: "M",
        lastname: "Doe",
      },
      contact: "+1234567890",
      email: "john.doe@example.com",
      username: "john_doe",
      bank_account_no: "1234567890123456",
      password: "password123",
      id_proof: "Base64 encoded file data",
      profile_photo: "Base64 encoded file data",
      role: "employee",
    },
    {
      employee_id: "EMP12347",
      name: {
        firstname: "John",
        middlename: "M",
        lastname: "Doe",
      },
      contact: "+1234567890",
      email: "john.doe@example.com",
      username: "john_doe",
      bank_account_no: "1234567890123456",
      password: "password123",
      id_proof: "Base64 encoded file data",
      profile_photo: "Base64 encoded file data",
      role: "employee",
    },
    {
      employee_id: "EMP12348",
      name: {
        firstname: "John",
        middlename: "M",
        lastname: "Doe",
      },
      contact: "+1234567890",
      email: "john.doe@example.com",
      username: "john_doe",
      bank_account_no: "1234567890123456",
      password: "password123",
      id_proof: "Base64 encoded file data",
      profile_photo: "Base64 encoded file data",
      role: "employee",
    },
    {
      employee_id: "EMP12349",
      name: {
        firstname: "John",
        middlename: "M",
        lastname: "Doe",
      },
      contact: "+1234567890",
      email: "john.doe@example.com",
      username: "john_doe",
      bank_account_no: "1234567890123456",
      password: "password123",
      id_proof: "Base64 encoded file data",
      profile_photo: "Base64 encoded file data",
      role: "employee",
    },
    {
      employee_id: "EMP12350",
      name: {
        firstname: "John",
        middlename: "M",
        lastname: "Doe",
      },
      contact: "+1234567890",
      email: "john.doe@example.com",
      username: "john_doe",
      bank_account_no: "1234567890123456",
      password: "password123",
      id_proof: "Base64 encoded file data",
      profile_photo: "Base64 encoded file data",
      role: "employee",
    },
  ];

  React.useEffect(() => {
    (async () => {
      try {
        let res = await getEmployees();
        if (res) {
          toast({
            title: "Successful",
            description: "Employees list has been fetched successfully",
          });
        }
        setIsLoading(false);
      } catch (e: any) {
        setIsLoading(false);
        console.log(e);
      }
    })();
  }, []);

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone No</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empData.map((row: any) => {
            return (
              <TableRow key={row.employee_id}>
                <TableCell>{row.employee_id}</TableCell>
                <TableCell>{row.name.firstname + row.name.lastname}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.contact}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Ellipsis size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-16">
                      <DropdownMenuItem>
                        <View size={16} />
                        <Link href="employees/view/BS123" className="ml-2">
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <PencilLine size={16} />
                        <div className={"ml-2"}>Edit</div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash2 size={16} />
                        <div className={"ml-2"}>Delete</div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
