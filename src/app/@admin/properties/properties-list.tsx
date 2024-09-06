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
  const { toast } = useToast();
  const router = useRouter();

  let propertiesData: any = [
    {
      property_id: "PROP12340",
      property_type: "Resident Buildings",
      property_manager_name: "Manager Name",
      property_manager_phone_no: "+1234567890",
      email: "manager@example.com",
      owner_name: "Owner Name",
      owner_number: "+1234567890",
      apartment_type: "2BHK",
      housing_type: "Public",
      borough_name: "Brooklyn",
      street_name: "Main Street",
      building_number: "123",
      chute_present: true,
      number_of_floors: 5,
      number_of_basement_floors: 1,
      number_of_units_per_floor: 4,
      number_of_units_total: 20,
      franchise_name: "McDonald's",
      inside_a_mall: false,
      mall_name: "Mall Name",
      is_event: false,
      event_name: "Event Name",
      retail_or_office: true,
      industry_type: "Food",
      handling: "Federal",
      department: "Health",
      is_bid: true,
      area_covered: "Main Street",
      building_type: "School",
      school: "Elementary",
    },
    {
      property_id: "PROP12341",
      property_type: "Resident Buildings",
      property_manager_name: "Manager Name",
      property_manager_phone_no: "+1234567890",
      email: "manager@example.com",
      owner_name: "Owner Name",
      owner_number: "+1234567890",
      apartment_type: "2BHK",
      housing_type: "Public",
      borough_name: "Brooklyn",
      street_name: "Main Street",
      building_number: "123",
      chute_present: true,
      number_of_floors: 5,
      number_of_basement_floors: 1,
      number_of_units_per_floor: 4,
      number_of_units_total: 20,
      franchise_name: "McDonald's",
      inside_a_mall: false,
      mall_name: "Mall Name",
      is_event: false,
      event_name: "Event Name",
      retail_or_office: true,
      industry_type: "Food",
      handling: "Federal",
      department: "Health",
      is_bid: true,
      area_covered: "Main Street",
      building_type: "School",
      school: "Elementary",
    },
    {
      property_id: "PROP12342",
      property_type: "Resident Buildings",
      property_manager_name: "Manager Name",
      property_manager_phone_no: "+1234567890",
      email: "manager@example.com",
      owner_name: "Owner Name",
      owner_number: "+1234567890",
      apartment_type: "2BHK",
      housing_type: "Public",
      borough_name: "Brooklyn",
      street_name: "Main Street",
      building_number: "123",
      chute_present: true,
      number_of_floors: 5,
      number_of_basement_floors: 1,
      number_of_units_per_floor: 4,
      number_of_units_total: 20,
      franchise_name: "McDonald's",
      inside_a_mall: false,
      mall_name: "Mall Name",
      is_event: false,
      event_name: "Event Name",
      retail_or_office: true,
      industry_type: "Food",
      handling: "Federal",
      department: "Health",
      is_bid: true,
      area_covered: "Main Street",
      building_type: "School",
      school: "Elementary",
    },
    {
      property_id: "PROP12343",
      property_type: "Resident Buildings",
      property_manager_name: "Manager Name",
      property_manager_phone_no: "+1234567890",
      email: "manager@example.com",
      owner_name: "Owner Name",
      owner_number: "+1234567890",
      apartment_type: "2BHK",
      housing_type: "Public",
      borough_name: "Brooklyn",
      street_name: "Main Street",
      building_number: "123",
      chute_present: true,
      number_of_floors: 5,
      number_of_basement_floors: 1,
      number_of_units_per_floor: 4,
      number_of_units_total: 20,
      franchise_name: "McDonald's",
      inside_a_mall: false,
      mall_name: "Mall Name",
      is_event: false,
      event_name: "Event Name",
      retail_or_office: true,
      industry_type: "Food",
      handling: "Federal",
      department: "Health",
      is_bid: true,
      area_covered: "Main Street",
      building_type: "School",
      school: "Elementary",
    },
    {
      property_id: "PROP12344",
      property_type: "Resident Buildings",
      property_manager_name: "Manager Name",
      property_manager_phone_no: "+1234567890",
      email: "manager@example.com",
      owner_name: "Owner Name",
      owner_number: "+1234567890",
      apartment_type: "2BHK",
      housing_type: "Public",
      borough_name: "Brooklyn",
      street_name: "Main Street",
      building_number: "123",
      chute_present: true,
      number_of_floors: 5,
      number_of_basement_floors: 1,
      number_of_units_per_floor: 4,
      number_of_units_total: 20,
      franchise_name: "McDonald's",
      inside_a_mall: false,
      mall_name: "Mall Name",
      is_event: false,
      event_name: "Event Name",
      retail_or_office: true,
      industry_type: "Food",
      handling: "Federal",
      department: "Health",
      is_bid: true,
      area_covered: "Main Street",
      building_type: "School",
      school: "Elementary",
    },
    {
      property_id: "PROP12345",
      property_type: "Resident Buildings",
      property_manager_name: "Manager Name",
      property_manager_phone_no: "+1234567890",
      email: "manager@example.com",
      owner_name: "Owner Name",
      owner_number: "+1234567890",
      apartment_type: "2BHK",
      housing_type: "Public",
      borough_name: "Brooklyn",
      street_name: "Main Street",
      building_number: "123",
      chute_present: true,
      number_of_floors: 5,
      number_of_basement_floors: 1,
      number_of_units_per_floor: 4,
      number_of_units_total: 20,
      franchise_name: "McDonald's",
      inside_a_mall: false,
      mall_name: "Mall Name",
      is_event: false,
      event_name: "Event Name",
      retail_or_office: true,
      industry_type: "Food",
      handling: "Federal",
      department: "Health",
      is_bid: true,
      area_covered: "Main Street",
      building_type: "School",
      school: "Elementary",
    },
  ];

  React.useEffect(() => {
    (async () => {
      try {
        let res = await getProperties();
        if (res) {
          // toast({
          //   title: "Successful",
          //   description: "Properties list has been fetched successfully",
          // });
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
          {propertiesData.map((row: any) => {
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
                          onClick={() => viewProperty("BS12")}
                        >
                          <View size={16} />
                          <span className="pl-2">View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => editProperty("BS12")}
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
                            deletePropertyById("BS12");
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
