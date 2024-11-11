"use client";
import React from 'react';

// Zod form
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

//Shadcn components
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
import { addGarbageEntry } from "../../../services";

// Mock property data
type MockProperty = {
    id: string;
    client_id: string;
    client_type: string;
    client_name: string;
    borough_name: string;
    street_name: string;
    chute_present: string;
    timestamp: string;
    garbageAttributes: string[];
};

const mockProperties: MockProperty[] = [
    {
        id: "PROP12345",
        client_id: "CLI2347",
        client_type: "residential",
        client_name: "John Doe",
        borough_name: "Manhattan",
        street_name: "5th Avenue",
        chute_present: "yes",
        timestamp: "2024-08-15T14:30:00Z",
        garbageAttributes: ["plastic", "Cardboard"],
    },
    {
        id: "PROP12346",
        client_id: "CLI2347",
        client_type: "commercial",
        client_name: "ABC Corp",
        borough_name: "Brooklyn",
        street_name: "Bedford Avenue",
        chute_present: "no",
        timestamp: "2024-08-15T14:30:00Z",
        garbageAttributes: ["plastic", "Glass"],
    }
];

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
  garbage_attributes: z.array(z.string()).min(1, "At least one garbage attribute is required"),
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
      garbage_attributes: ["plastic"],
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

  const handlePropertySelect = (propertyId: string) => {
    const property = mockProperties.find(prop => prop.id === propertyId);
    if (property) {
      // Exclude the 'id' field when setting values
      const { id, ...propertyData } = property;
      Object.entries(propertyData).forEach(([key, value]) => {
        setValue(key as keyof FormValues, value);
      });
      setValue('property_id', id);
    }
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
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Add New Entry</CardTitle>
          <p className="text-sm text-gray-500">
            Add a new garbage entry, verify all the details before submission.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyId">Property Id</Label>
                  <Select onValueChange={handlePropertySelect}>
                    <SelectTrigger id="propertyId">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProperties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          Property {property.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.property_id && (
                    <p className="text-sm text-red-500">{errors.property_id.message}</p>
                  )}
                </div>

                {/* Rest of the form remains the same */}
                <div className="space-y-2">
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

                <div className="space-y-2">
                  <Label htmlFor="garbageAttributes">Garbage Attributes</Label>
                  <Select>
                    <SelectTrigger id="garbageAttributes">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plastic">Plastic</SelectItem>
                      <SelectItem value="cardboard">Cardboard</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.garbage_attributes && (
                    <p className="text-sm text-red-500">{errors.garbage_attributes.message}</p>
                  )}
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
        </CardContent>
      </Card>
    </>
  );
};

export default NewEntryPage;