"use client";

import * as React from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { suggestID, addProperty } from "@/services/index";

export default function MunicipalPropertyForm({ className, ...props }: any) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<string>("");
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchSuggestedId = async () => {
     try {
       const response = await suggestID('property');
       form.setValue("propertyId", response.data.suggested_property_id)
     } catch (err) {
       console.error(err);
     }
    };
    fetchSuggestedId();
 },[]);

  const formSchema = z.object({
    propertyId: z
      .string()
      .min(1, { message: "Please enter property id" })
      .max(50),
    handling: z
      .string()
      .min(1, { message: "Please enter the handling type" })
      .max(50),
    department: z
      .string()
      .min(1, { message: "Please enter the department" })
      .max(50),
    bid: z.string().min(1, { message: " Please select BID details" }).max(50),
    buildingType: z
      .string()
      .min(1, { message: "Please enter the building type" })
      .max(50),
    buildingAddress: z
      .string()
      .min(1, { message: "Please enter the building address" })
      .max(50),
    boroughName: z
      .string()
      .min(1, { message: "Please enter the borough name" }),
    streetOrAvenueName: z
      .string()
      .min(1, { message: "Please enter the street or avenue name" }),
    propertyManagerName: z
      .string()
      .min(1, { message: "Please enter property manager's name" })
      .max(50),
    propertyManagerContact: z
      .string()
      .min(1, { message: "Please enter property manager's phone number" })
      .max(50),
    email: z.string().min(1, { message: "Please enter your email" }),
    isSchool: z
      .string()
      .min(1, { message: " Please select the school details" })
      .max(50),
    schoolType: z.string().min(1, { message: "Please enter the school type" }),
    schoolBoroughName: z
      .string()
      .min(1, { message: "Please enter the borough name" }),
    schoolStreetOrAvenueName: z
      .string()
      .min(1, { message: "Please enter the street or avenue name" }),
    schoolBuildingNumber: z
      .string()
      .min(1, { message: "Please enter the school's building number" }),
    chutePresent: z
      .string()
      .min(1, { message: "Please select if chute is present" }),
    chuteFloorLevel: z.coerce.number({
      message: "Please enter floor level",
    }),
    noOfFloors: z.coerce.number({
      message: "Please enter the no. of floors",
    }),
    noOfBasementFloors: z.coerce.number({
      message: "Please enter the no. of basement floors",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: "",
      handling: "",
      department: "",
      bid: "No",
      buildingType: "-",
      buildingAddress: "-",
      boroughName: "-",
      streetOrAvenueName: "-",
      propertyManagerName: "",
      propertyManagerContact: "",
      isSchool: "No",
      schoolType: "-",
      schoolBoroughName: "-",
      schoolStreetOrAvenueName: "-",
      schoolBuildingNumber: "-",
      chutePresent: "No",
      chuteFloorLevel: 0,
      noOfFloors: 0,
      noOfBasementFloors: 0,
      email: ""
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIsError("");

    try {
      let propertyDetails = {
        property_id: values.propertyId,
        handling: values.handling,
        department: values.department,
        is_bid: values.bid == "Yes" ? true : false,
        building_type: values.buildingType,
        building_address: values.buildingAddress,
        borough_name: values.boroughName,
        street_name: values.streetOrAvenueName,
        property_manager_name: values.propertyManagerName,
        property_manager_phone_no: values.propertyManagerContact,
        is_school: values.isSchool == "Yes" ? true : false,
        school_type: values.schoolType,
        school_borough_name: values.schoolBoroughName,
        school_street_name: values.schoolStreetOrAvenueName,
        school_building_number: values.schoolBuildingNumber,
        chute_present: values.chutePresent == "Yes" ? true : false,
        chute_floor_level: values.chuteFloorLevel,
        number_of_floors: values.noOfFloors,
        number_of_basement_floors: values.noOfBasementFloors,
        email: values.email,
        property_type: "Municipal",
      };
      let res = await addProperty(propertyDetails);
      if (res) {
        toast({
          title: "Successful",
          description: "Property has been created successfully",
        });
      }
      setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
      if (e.response && e.response.data) {
        setIsError(e.response.data.error);
      }
      console.log(e);
    }
  }

  function clearForm() {
    form.reset();
  }

  function IsBidWatched({ control }: { control: any }) {
    const isBid = useWatch({
      control,
      name: "bid",
    });

    return isBid == "Yes" ? (
      <>
        <Image
          src="/form-child-arrow.svg"
          width={30}
          height={30}
          alt=""
          className="block dark:hidden ml-[6px] !mt-[16px]"
        />
        <div className="block dark:hidden ml-[54px] !mt-[-30px]">
          <FormField
            control={form.control}
            name="buildingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Building Type</FormLabel>
                <FormControl>
                  <Input
                    id="buildingType"
                    placeholder="Building Type"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="block dark:hidden ml-[54px]">
          <FormField
            control={form.control}
            name="buildingAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Building Address</FormLabel>
                <FormControl>
                  <Input
                    id="buildingAddress"
                    placeholder="Building Address"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </>
    ) : (
      <>
        <Image
          src="/form-child-arrow.svg"
          width={30}
          height={30}
          alt=""
          className="block dark:hidden ml-[6px] !mt-[16px]"
        />
        <div className="block dark:hidden ml-[54px] !mt-[-30px]">
          <FormField
            control={form.control}
            name="boroughName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Borough Name</FormLabel>
                <FormControl>
                  <Input
                    id="boroughName"
                    placeholder="Borough Name"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="block dark:hidden ml-[54px]">
          <FormField
            control={form.control}
            name="streetOrAvenueName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Name or Avenue Name</FormLabel>
                <FormControl>
                  <Input
                    id="streetOrAvenueName"
                    placeholder="Street Name or Avenue Name"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </>
    ); // only re-render at the custom hook level, when bid changes
  }

  function IsSchoolWatched({ control }: { control: any }) {
    const isSchool = useWatch({
      control,
      name: "isSchool",
    });

    return isSchool == "Yes" ? (
      <>
        <Image
          src="/form-child-arrow.svg"
          width={30}
          height={30}
          alt=""
          className="block dark:hidden ml-[6px] !mt-[16px]"
        />
        <div className="block dark:hidden ml-[54px] !mt-[-30px]">
          <FormField
            control={form.control}
            name="schoolType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Type</FormLabel>
                <FormControl>
                  <Input
                    id="schoolType"
                    placeholder="School Type"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                {}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="block dark:hidden ml-[54px]">
          <FormField
            control={form.control}
            name="schoolBoroughName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Borough Name</FormLabel>
                <FormControl>
                  <Input
                    id="schoolBoroughName"
                    placeholder="Borough Name"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                {}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="block dark:hidden ml-[54px]">
          <FormField
            control={form.control}
            name="schoolStreetOrAvenueName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Name or Avenue Name</FormLabel>
                <FormControl>
                  <Input
                    id="schoolStreetOrAvenueName"
                    placeholder="Street Name or Avenue Name"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                {}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="block dark:hidden ml-[54px]">
          <FormField
            control={form.control}
            name="schoolBuildingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Building Number</FormLabel>
                <FormControl>
                  <Input
                    id="schoolBuildingNumber"
                    placeholder="Building Number"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                {}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="block dark:hidden ml-[54px]">
          <FormField
            control={form.control}
            name="chutePresent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chute Present</FormLabel>
                <FormControl>
                  <RadioGroup
                    id="chutePresent"
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    className="flex"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="r1" />
                      <Label htmlFor="r1">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="r2" />
                      <Label htmlFor="r2">No</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ChutePresentWatched control={form.control} />
      </>
    ) : (
      ""
    ); // only re-render at the custom hook level, when isSchool changes
  }

  function ChutePresentWatched({ control }: { control: any }) {
    const chutePresent = useWatch({
      control,
      name: "chutePresent",
    });

    return chutePresent == "Yes" ? (
      <>
        <Image
          src="/form-child-arrow.svg"
          width={30}
          height={30}
          alt=""
          className="block dark:hidden ml-[60px] !mt-[16px]"
        />
        <div className="block dark:hidden ml-[104px] !mt-[-30px]">
          <FormField
            control={form.control}
            name="chuteFloorLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chute Floor Level</FormLabel>
                <FormControl>
                  <Input
                    id="chuteFloorLevel"
                    placeholder="Chute Floor Level"
                    type="number"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                {}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </>
    ) : (
      ""
    ); // only re-render at the custom hook level, when chutePresent changes
  }

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Id</FormLabel>
                <FormControl>
                  <Input
                    id="propertyId"
                    placeholder="Property Id"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="propertyId"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="handling"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Handling</FormLabel>
                <FormControl>
                  <Input
                    id="handling"
                    placeholder="Handling"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="handling"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input
                    id="department"
                    placeholder="Department"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="department"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Is it a BID (Business Improvement District) ?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    id="bid"
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    className="flex"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="r1" />
                      <Label htmlFor="r1">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="r2" />
                      <Label htmlFor="r2">No</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <IsBidWatched control={form.control} />

          <FormField
            control={form.control}
            name="propertyManagerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Manager Name</FormLabel>
                <FormControl>
                  <Input
                    id="propertyManagerName"
                    placeholder="Property Manager Name"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyManagerContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Manager Phone Number</FormLabel>
                <FormControl>
                  <Input
                    id="propertyManagerContact"
                    placeholder="Property Manager Phone Number"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="Email">Property Manager Email</FormLabel>
                <FormControl>
                  <Input
                    id="Email"
                    placeholder="Property Manager Email"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isSchool"
            render={({ field }) => (
              <FormItem>
                <FormLabel>If school</FormLabel>
                <FormControl>
                  <RadioGroup
                    id="isSchool"
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    className="flex"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="r1" />
                      <Label htmlFor="r1">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="r2" />
                      <Label htmlFor="r2">No</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <IsSchoolWatched control={form.control} />
          <div className="mt-6">
            <Button
              onClick={() => clearForm()}
              variant="outline"
              className="!mt-3 mr-3"
              disabled={isLoading}
            >
              Clear
            </Button>

            <Button
              onClick={() => {
                console.log(form.formState.errors);
              }}
              className="!mt-3"
              disabled={isLoading}
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit
            </Button>
          </div>
        </form>
      </Form>
      {isError !== "" && !isLoading && (
        <p className="text-[0.8rem] font-medium text-destructive">{isError}</p>
      )}
    </div>
  );
}
