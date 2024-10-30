"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { getProperties, deleteProperty } from "@/services/index";
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
  const [properties, setProperties] = React.useState([]);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    (async () => {
      try {
        let res = await getProperties();
        if (res) {
          // toast({
          //   title: "Successful",
          //   description: "Properties list has been fetched successfully",
          // });
          setProperties(res.data);
        }
      } catch (e: any) {
        console.log(e);
      }
    })();
  }, []);

  function viewProperty(empId: string) {
    router.push(`properties/view/${empId}`);
  }

  function editProperty(empId: string) {
    router.push(`properties/edit/${empId}`);
  }

  function openDeleteModal() {
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setDeleteModalOpen(false);
  }

  async function deletePropertyById(propertyId: string) {
    setIsLoading(true);
    try {
      let res: any = await deleteProperty(propertyId);
      if (res) {
        toast({
          title: "Successful",
          description: `Property ${propertyId} has been deleted successfully`,
        });
      }
      setIsLoading(false);
      closeDeleteModal();
    } catch (e: any) {
      setIsLoading(false);
      closeDeleteModal();
      toast({
        title: "Failed",
        description: `Failed to delete property, please try again`,
      });
      console.log(e);
    }
  }

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property Id</TableHead>
            <TableHead>Property Manager Name</TableHead>
            <TableHead>Property Manager Phone No</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((row: any) => {
            return (
              <TableRow key={row.property_id}>
                <TableCell>{row.property_id}</TableCell>
                <TableCell>{row.property_manager_name}</TableCell>
                <TableCell>{row.property_manager_phone_no}</TableCell>
                <TableCell>{row.email}</TableCell>
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
                          onClick={() => viewProperty(row.property_id)}
                        >
                          <View size={16} />
                          <span className="pl-2">View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => editProperty(row.property_id)}
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
                          delete the property and remove the data.
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
                            deletePropertyById(row.property_id);
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
