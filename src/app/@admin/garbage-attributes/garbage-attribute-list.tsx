"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { getGarbageAttributes, editGarbageAttribute, addGarbageAttribute } from "@/services/index";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/ui/icons";


import { View, PencilLine, Trash2, Ellipsis } from "lucide-react";

import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";

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

export default function GarbageAttributeList({
  className,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [addModalOpen, setAddModalOpen] = React.useState<boolean>(false);
  const [attributes, setAttributes] = React.useState<any>([]);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    (async () => {
      try {
        let res = await getGarbageAttributes();
        if (res) {
          setAttributes(res.data);
        }
      } catch (e: any) {
        console.log(e);
      }
    })();
  }, []);


  function editGarbageAttribute(name: string) {
    router.push(`garbage-attributes/edit/${name}`);
  }

  function openAddModal() {
    setAddModalOpen(true);
  }

  function closeAddModal() {
    setAddModalOpen(false);
  }

  // async function deleteEmployeeById(empId: string) {
  //   setIsLoading(true);
  //   try {
  //     let res: any = await deleteEmployee(empId);
  //     if (res) {
  //       toast({
  //         title: "Successful",
  //         description: `Employee ${empId} has been deleted successfully`,
  //       });
  //     }
  //     setIsLoading(false);
  //     closeDeleteModal();
  //   } catch (e: any) {
  //     setIsLoading(false);
  //     closeDeleteModal();
  //     toast({
  //       title: "Failed",
  //       description: `Failed to delete employee, please try again`,
  //     });
  //     console.log(e);
  //   }
  // }

  return (
    <div className="flex flex-row gap-x-6">
      {attributes.length > 0 && attributes.map((attribute : any, index: number) => {
        return(
          <Card key={index} className="rounded-md my-2 p-1 shadow-md min-w-52">
            <CardHeader className="flex flex-row items-center justify-end p-0 space-y-0">
              <Button size="icon" variant="link" className="h-7 w-7">
                <PencilLine className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
              <Button size="icon" variant="link" className="h-7 w-7">
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-row items-center">
              <div style={{backgroundColor: attribute.color}} className={`rounded-full app-color-code h-8 w-8 mr-4`}></div>
              <h3 className="font-semibold">{attribute?.attribute_name}</h3>
            </CardContent>
          </Card>
        )
      })}
      <Card onClick={() => openAddModal()} className="flex flex-col items-center justify-center rounded-md my-2 p-1 shadow-md min-w-52">
        <CardContent className="flex flex-col items-center justify-center pb-0">
          <PencilLine className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          <h3 className="font-semibold">Add New</h3>
        </CardContent>
      </Card>
      <AlertDialog open={addModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Add Garbage Attribute
            </AlertDialogTitle>
            <AlertDialogDescription>
              Add a new garbage attribute here, click submit when you're done.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                closeAddModal();
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              // onClick={() => {
              //   deleteEmployeeById(row.employee_id);
              // }}
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                ""
              )}
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
