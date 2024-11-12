"use client";
import React from 'react';

// Zod form
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

//Shadcn components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb";

//services
import { addGarbageEntry, getProperties, getPropertyDetails } from "../../../services";

// Mock property data
type Property = {
    property_id: string;
    client_id: string;
    client_type: string;
    client_name: string;
    borough_name: string;
    street_name: string;
    chute_present: string;
    timestamp: string;
};

// Zod schema for form validation
const formSchema = z.object({
  property_id: z.string().min(1, "Property ID is required"),
  client_id: z.string().min(1, "Client ID is required"),
  client_type: z.string().min(1, "Client type is required"),
  client_name: z.string().min(2, "Client name must be at least 2 characters"),
  borough_name: z.string().min(2, "Borough name is required"),
  street_name: z.string().min(2, "Street name is required"),
  timestamp: z.string().min(2, "Timestamp must be included"),
  chute_present: z.enum(["yes", "no"]),
  created_by: z.string().min(1, "Created by"),
  metal: z.number().min(0),
  glass: z.number().min(0),
  plastic: z.number().min(0),
  eWaste: z.number().min(0),
  fabric: z.number().min(0),
  cardboard: z.number().min(0),
  otherPaper: z.number().min(0),
  landfill: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

const NewEntryPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties ] = useState<Property[]>([]);

  const getPropertiesList = async () => {
    const res = await getProperties();
    setProperties(res);
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      property_id: "",
      client_type: "",
      client_name: "",
      borough_name: "",
      street_name: "",
      chute_present: "yes",
      timestamp: "2024-08-15T14:30:00Z",
      created_by: "sonu2k",
      metal: 0,
      glass: 0,
      plastic: 0,
      eWaste: 0,
      fabric: 0,
      cardboard: 0,
      otherPaper: 0,
      landfill: 0,
    },
  });

  const { register, handleSubmit, setValue, formState: { errors }, reset } = form;

  const handlePropertySelect = async (propertyId: string) => {
    const property = properties.find(prop => prop.property_id === propertyId);
    if (property) {
      console.log(property);
      try {
        const propertyDetails = await getPropertyDetails(propertyId);
        const property = propertyDetails.data;
        setValue("client_type", property.client_type);
        setValue("client_name", property.client_name);
        setValue("borough_name", property.borough_name);
        setValue("street_name", property.street_name);
        setValue("chute_present", property.chute_present);
        setValue("timestamp", property.timestamp);
        setValue("created_by", property.created_by);
        setValue("metal", property.metal);
        setValue("glass", property.glass);
        setValue("plastic", property.plastic);
        setValue("eWaste", property.eWaste);
        setValue("fabric", property.fabric);
        setValue("cardboard", property.cardboard);
      } catch (error) {
        throw error;
      }
      setValue('property_id', property.property_id);
    }
  };

  const handleOnOpenChange = () => {
    return getPropertiesList();
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await addGarbageEntry(data);
      toast({
        title: "Success",
        description: "Garbage entry has been submitted successfully.",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit garbage entry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    reset();
  };

  const garbageTypes = [
    { key: "metal", label: "Metal" },
    { key: "glass", label: "Glass" },
    { key: "plastic", label: "Plastic" },
    { key: "eWaste", label: "E-Waste" },
    { key: "fabric", label: "Fabric" },
    { key: "cardboard", label: "Cardboard" },
    { key: "otherPaper", label: "Other Paper" },
    { key: "landfill", label: "Landfill" },
  ] as const;

  return (
    <>
      <Breadcrumb className="hidden md:flex -mt-[44px] z-50">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/">New Entry</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add New Entry</CardTitle>
          <p className="text-sm text-gray-500">
            Add a new garbage entry, verify all the details before submission.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 sm:gap-20">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="property_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="propertyId">Property Id</FormLabel>
                      <Select onValueChange={handlePropertySelect} onOpenChange={handleOnOpenChange} {...field}>
                        <SelectTrigger id="propertyId">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.property_id} value={property.property_id}>
                              {property.property_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <div className="space-y-1">
                  <Label htmlFor="propertyId">Property Id</Label>
                  <Select onValueChange={handlePropertySelect} onOpenChange={handleOnOpenChange}>
                    <SelectTrigger id="propertyId">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.property_id} value={property.property_id}>
                          {property.property_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.property_id && (
                    <p className="text-sm text-red-500">{errors.property_id.message}</p>
                  )}
                </div> */}

                <div className="space-y-0">
                  <Label htmlFor="clientId">Client Id</Label>
                  <Input 
                    id="clientId" 
                    {...register("client_id")}
                    className={errors.client_id ? "border-red-500" : ""}
                  />
                  {errors.client_id && (
                    <p className="text-sm text-red-500">{errors.client_id.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_type">Client Type</Label>
                  <Input 
                    id="client_type" 
                    {...register("client_type")}
                    className={errors.client_type ? "border-red-500" : ""}
                  />
                  {errors.client_type && (
                    <p className="text-sm text-red-500">{errors.client_type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input 
                    id="clientName" 
                    {...register("client_name")}
                    className={errors.client_name ? "border-red-500" : ""}
                  />
                  {errors.client_name && (
                    <p className="text-sm text-red-500">{errors.client_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="boroughName">Borough Name</Label>
                  <Input 
                    id="boroughName" 
                    {...register("borough_name")}
                    className={errors.borough_name ? "border-red-500" : ""}
                  />
                  {errors.borough_name && (
                    <p className="text-sm text-red-500">{errors.borough_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="streetName">Street Name/Avenue Name</Label>
                  <Input 
                    id="streetName" 
                    {...register("street_name")}
                    className={errors.street_name ? "border-red-500" : ""}
                  />
                  {errors.street_name && (
                    <p className="text-sm text-red-500">{errors.street_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Chute present</Label>
                  <RadioGroup 
                    defaultValue="yes"
                    onValueChange={(value: "yes" | "no") => setValue("chute_present", value)}
                    className="flex items-center gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Garbage Segregation</h3>
                {garbageTypes.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-4">
                    <Label className="w-24">{label}</Label>
                    <Input
                      type="number"
                      {...register(key, { valueAsNumber: true })}
                      className={`w-20 ${errors[key] ? "border-red-500" : ""}`}
                    />
                    <span className="text-gray-500">lbs</span>
                    {errors[key] && (
                      <p className="text-sm text-red-500">{errors[key].message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-start gap-4 mt-6">
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default NewEntryPage;