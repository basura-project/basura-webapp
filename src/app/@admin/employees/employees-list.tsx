"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { getEmployees, deleteEmployee } from "@/services/index";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/ui/icons";

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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function EmployeesList({
  className,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState<boolean>(false);
  const [employees, setEmployees] = React.useState([]);
  const { toast } = useToast();
  const router = useRouter();

  // let empData: any = [
  //   {
  //     employee_id: "EMP12345",
  //     name: {
  //       firstname: "John",
  //       middlename: "M",
  //       lastname: "Doe",
  //     },
  //     contact: "+1234567890",
  //     email: "john.doe@example.com",
  //     username: "john_doe",
  //     bank_account_no: "1234567890123456",
  //     password: "password123",
  //     id_proof: "Base64 encoded file data",
  //     profile_photo: "Base64 encoded file data",
  //     role: "employee",
  //   },
  //   {
  //     employee_id: "EMP12346",
  //     name: {
  //       firstname: "John",
  //       middlename: "M",
  //       lastname: "Doe",
  //     },
  //     contact: "+1234567890",
  //     email: "john.doe@example.com",
  //     username: "john_doe",
  //     bank_account_no: "1234567890123456",
  //     password: "password123",
  //     id_proof: "Base64 encoded file data",
  //     profile_photo: "Base64 encoded file data",
  //     role: "employee",
  //   },
  //   {
  //     employee_id: "EMP12347",
  //     name: {
  //       firstname: "John",
  //       middlename: "M",
  //       lastname: "Doe",
  //     },
  //     contact: "+1234567890",
  //     email: "john.doe@example.com",
  //     username: "john_doe",
  //     bank_account_no: "1234567890123456",
  //     password: "password123",
  //     id_proof: "Base64 encoded file data",
  //     profile_photo: "Base64 encoded file data",
  //     role: "employee",
  //   },
  //   {
  //     employee_id: "EMP12348",
  //     name: {
  //       firstname: "John",
  //       middlename: "M",
  //       lastname: "Doe",
  //     },
  //     contact: "+1234567890",
  //     email: "john.doe@example.com",
  //     username: "john_doe",
  //     bank_account_no: "1234567890123456",
  //     password: "password123",
  //     id_proof: "Base64 encoded file data",
  //     profile_photo: "Base64 encoded file data",
  //     role: "employee",
  //   },
  //   {
  //     employee_id: "EMP12349",
  //     name: {
  //       firstname: "John",
  //       middlename: "M",
  //       lastname: "Doe",
  //     },
  //     contact: "+1234567890",
  //     email: "john.doe@example.com",
  //     username: "john_doe",
  //     bank_account_no: "1234567890123456",
  //     password: "password123",
  //     id_proof: "Base64 encoded file data",
  //     profile_photo: "Base64 encoded file data",
  //     role: "employee",
  //   },
  //   {
  //     employee_id: "EMP12350",
  //     name: {
  //       firstname: "John",
  //       middlename: "M",
  //       lastname: "Doe",
  //     },
  //     contact: "+1234567890",
  //     email: "john.doe@example.com",
  //     username: "john_doe",
  //     bank_account_no: "1234567890123456",
  //     password: "password123",
  //     id_proof: "Base64 encoded file data",
  //     profile_photo: "Base64 encoded file data",
  //     role: "employee",
  //   },
  // ];

  React.useEffect(() => {
    (async () => {
      try {
        let res = await getEmployees();
        if (res) {
          toast({
            title: "Successful",
            description: "Employees list has been fetched successfully",
          });
          setEmployees(res.data);
        }
      } catch (e: any) {
        console.log(e);
      }
    })();
  }, []);

  function viewEmployee(empId: string) {
    router.push(`employees/view/${empId}`);
  }

  function editEmployee(empId: string) {
    router.push(`employees/edit/${empId}`);
  }

  function openDeleteModal() {
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setDeleteModalOpen(false);
  }

  async function deleteEmployeeById(empId: string) {
    setIsLoading(true);
    try {
      let res: any = await deleteEmployee(empId);
      if (res) {
        toast({
          title: "Successful",
          description: `Employee ${empId} has been deleted successfully`,
        });
      }
      setIsLoading(false);
      closeDeleteModal();
    } catch (e: any) {
      setIsLoading(false);
      closeDeleteModal();
      toast({
        title: "Failed",
        description: `Failed to delete employee, please try again`,
      });
      console.log(e);
    }
  }

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
          {employees.map((row: any) => {
            return (
              <TableRow key={row.employee_id}>
                <TableCell>{row.employee_id}</TableCell>
                <TableCell>
                  {row.name && row.name}
                </TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.contact}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog open={deleteModalOpen}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Ellipsis size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-16">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => viewEmployee(row.employee_id)}
                        >
                          <View size={16} />
                          <span className="pl-2">View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => editEmployee(row.employee_id)}
                        >
                          <PencilLine size={16} />
                          <span className="pl-2">Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteModal()}
                          className="cursor-pointer"
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="link"
                              className="-mx-[14px] -my-2 font-normal hover:no-underline"
                            >
                              <Trash2 size={16} />
                              <span className="pl-2">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the employee and remove the data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => {
                            closeDeleteModal();
                          }}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={isLoading}
                          onClick={() => {
                            deleteEmployeeById(row.employee_id);
                          }}
                        >
                          {isLoading ? (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            ""
                          )}
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
