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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast";
import { suggestID, addProperty } from "@/services/index";

export default function CommercialPropertyForm({ className, ...props }: any) {
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
    franchiseName: z
      .string()
      .min(1, { message: "Please enter franchise's name" })
      .max(50),
    propertyManagerName: z
      .string()
      .min(1, { message: "Please enter property manager's name" })
      .max(50),
    propertyManagerContact: z
      .string()
      .min(1, { message: "Please enter property manager's phone number" })
      .max(50),
    boroughName: z.string().min(1, { message: "Please enter borough name" }),
    streetName: z.string().min(1, { message: "Please enter street name" }),
    buildingNo: z.string().min(1, { message: "Please enter building number" }),
    insideAMall: z
      .string()
      .min(1, { message: "Please select if the property is inside a mall" }),
    mallName: z
      .string()
      .min(1, { message: "Please enter mall's name" })
      .max(50),
    isAnEvent: z.string().min(1, { message: "Please select if it's an event" }),
    eventName: z
      .string()
      .min(1, { message: "Please enter event's name" })
      .max(50),
    retailOrOffice: z.string().min(1, {
      message: "Please select if the property is for retail or office",
    }),
    industryType: z
      .string()
      .min(1, { message: "Please enter industry type" })
      .max(50),
    chutePresent: z
      .string()
      .min(1, { message: "Please select if chute is present" }),
    chuteFloorLevel: z.coerce.number({
      message: "Please enter floor level",
    }),
    chuteFloorAll: z.coerce.boolean().optional(),
    noOfFloors: z.coerce.number({
      message: "Please enter the no. of floors",
    }),
    noOfBasementFloors: z.coerce.number({
      message: "Please enter the no. of basement floors",
    }),
    noOfUnitsPerFloor: z.coerce.number({
      message: "Please enter the no. of units per floor",
    }),
    noOfUnitsInTotal: z.coerce.number({
      message: "Please enter the no. of units in total",
    }),
    email: z
      .string()
      .min(1, { message: "Please enter email" })
      .email("This is not a valid email."),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyId: "",
      franchiseName: "",
      propertyManagerName: "",
      propertyManagerContact: "",
      boroughName: "",
      streetName: "",
      buildingNo: "",
      insideAMall: "No",
      mallName: "-",
      isAnEvent: "No",
      eventName: "-",
      retailOrOffice: "No",
      industryType: "",
      chutePresent: "No",
      chuteFloorLevel: 0,
      noOfFloors: 0,
      noOfBasementFloors: 0,
      noOfUnitsPerFloor: 0,
      noOfUnitsInTotal: 0,
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIsError("");

    try {
      let propertyDetails = {
        property_id: values.propertyId,
        franchise_name: values.franchiseName,
        property_manager_name: values.propertyManagerName,
        property_manager_phone_no: values.propertyManagerContact,
        borough_name: values.boroughName,
        street_name: values.streetName,
        building_number: values.buildingNo,
        inside_a_mall: values.insideAMall == "Yes" ? true : false,
        mall_name: values.mallName,
        is_event: values.isAnEvent == "Yes" ? true : false,
        event_name: values.eventName,
        retail_or_office: values.retailOrOffice == "Yes" ? true : false,
        industry_type: values.industryType,
        chute_present: values.chutePresent == "Yes" ? true : false,
        chute_floor_level: values.chuteFloorLevel,
        chuteFloorAll: values.chuteFloorAll,
        number_of_floors: values.noOfFloors,
        number_of_basement_floors: values.noOfBasementFloors,
        number_of_units_per_floor: values.noOfUnitsPerFloor,
        number_of_units_total: values.noOfUnitsInTotal,
        email: values.email,
        property_type: "Commercial",
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

  function InsideMallWatched({ control }: { control: any }) {
    const insideAMall = useWatch({
      control,
      name: "insideAMall",
    });

    return insideAMall == "Yes" ? (
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
            name="mallName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mall Name</FormLabel>
                <FormControl>
                  <Input
                    id="mallName"
                    placeholder="Mall Name"
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
      </>
    ) : (
      ""
    ); // only re-render at the custom hook level, when insideAMall changes
  }

  function IsAnEventWatched({ control }: { control: any }) {
    const isAnEvent = useWatch({
      control,
      name: "isAnEvent",
    });

    return isAnEvent == "Yes" ? (
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
            name="eventName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input
                    id="eventName"
                    placeholder="Event Name"
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
      </>
    ) : (
      ""
    ); // only re-render at the custom hook level, when isAnEvent changes
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
          className="block dark:hidden ml-[6px] !mt-[16px]"
        />
        <div className="block dark:hidden ml-[54px] !mt-[-30px]">
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
          <FormField
          control={form.control}
          name="chuteFloorAll"
          render={({ field }) => (
            <FormItem className="flex space-x-3 space-y-0 mt-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Chute present on all floors
                </FormLabel>
              </div>
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
            name="franchiseName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Franchise Name</FormLabel>
                <FormControl>
                  <Input
                    id="franchiseName"
                    placeholder="Franchise Name"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="franchiseName"
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
          <FormField
            control={form.control}
            name="streetName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Name</FormLabel>
                <FormControl>
                  <Input
                    id="streetName"
                    placeholder="Street Name"
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
            name="buildingNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Building No</FormLabel>
                <FormControl>
                  <Input
                    id="buildingNo"
                    placeholder="Building No"
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
            name="insideAMall"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inside a Mall</FormLabel>
                <FormControl>
                  <RadioGroup
                    id="insideAMall"
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

          <InsideMallWatched control={form.control} />

          <FormField
            control={form.control}
            name="isAnEvent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Is an Event</FormLabel>
                <FormControl>
                  <RadioGroup
                    id="isAnEvent"
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

          <IsAnEventWatched control={form.control} />

          <FormField
            control={form.control}
            name="retailOrOffice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retail or Office</FormLabel>
                <FormControl>
                  <RadioGroup
                    id="retailOrOffice"
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

          <FormField
            control={form.control}
            name="industryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry Type</FormLabel>
                <FormControl>
                  <Input
                    id="industryType"
                    placeholder="Industry Type"
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

          <ChutePresentWatched control={form.control} />

          <FormField
            control={form.control}
            name="noOfFloors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. of Floors</FormLabel>
                <FormControl>
                  <Input
                    id="noOfFloors"
                    placeholder="No of Floors"
                    type="number"
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
            name="noOfBasementFloors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. of Basement Floors</FormLabel>
                <FormControl>
                  <Input
                    id="noOfBasementFloors"
                    placeholder="No of Basement Floors"
                    type="number"
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
            name="noOfUnitsPerFloor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. of Units per Floor</FormLabel>
                <FormControl>
                  <Input
                    id="noOfUnitsPerFloor"
                    placeholder="No of Units per Floor"
                    type="number"
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
            name="noOfUnitsInTotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. of Units in Total</FormLabel>
                <FormControl>
                  <Input
                    id="noOfUnitsInTotal"
                    placeholder="No of Units in Total"
                    type="number"
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    placeholder="Email"
                    type="email"
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
