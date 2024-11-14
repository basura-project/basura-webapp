"use client";

import * as React from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  suggestID,
  addClient,
  getUnAssignedProperties,
  getPropertyDetails,
} from "@/services/index";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function NewClientForm({
  className,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<string>("");
  const [unAssignedProperties, setUnAssignedProperties] = React.useState<any[]>(
    [""]
  );
  const [optionsLoading, setOptionsLoading] = React.useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    const fetchSuggestedId = async () => {
      try {
        const response = await suggestID("client");
        form.setValue("clientID", response.data.suggested_client_id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSuggestedId();
  }, []);

  const formSchema = z
    .object({
      clientID: z
        .string()
        .min(1, { message: "Please enter Client Id" })
        .max(50),
      name: z.string().min(1, { message: "Please enter Client Name" }).max(50),
      phone: z
        .string()
        .min(1, { message: "Please enter Client phone number" })
        .max(50),
      email: z
        .string()
        .min(1, { message: "Please enter email" })
        .email("This is not a valid email."),
      properties: z
        .array(z.string())
        .min(1, { message: "Please select a property" })
        .default([]),
      username: z.string().min(1, { message: "Please enter username" }).max(50),
      password: z.string().min(1, { message: "Please enter password" }).max(50),
      confirmPassword: z
        .string()
        .min(1, { message: "Please confirm password" })
        .max(50),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"], // path of error
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientID: "",
      name: "",
      phone: "",
      email: "",
      properties: [],
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIsError("");

    try {
      let clientDetails = {
        client_id: values.clientID,
        client_name: values.name,
        phone: values.phone,
        email: values.email,
        properties: values.properties,
        username: values.username,
        password: values.password,
      };
      let res = await addClient(clientDetails);
      if (res) {
        toast({
          title: "Successful",
          description: "Client has been created successfully",
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

  const handleOnOpen = async (state: boolean) => {
    // Fetch unassigned properties
    if (state) {
      setOptionsLoading(true);
      try {
        const unAssignedProperties = await getUnAssignedProperties();

        // Convert each property string to an object and wait for all to resolve
        const formattedProperties = await Promise.all(
          unAssignedProperties.map(async (property: string) => {
            const res = await getPropertyDetails(property);

            if (res) {
              return {
                label: res.data.property_id,
                value: res.data.property_id,
                category: res.data.property_type,
              };
            }
            // Return null or handle missing response appropriately
            return null;
          })
        );

        // Filter out any null results in case getPropertyDetails returned undefined
        setUnAssignedProperties(formattedProperties.filter(Boolean));
      } catch (err) {
        console.error("Error fetching unassigned properties", err);
      } finally {
        setOptionsLoading(false);
      }
    }
  };

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="clientID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Id</FormLabel>
                <FormControl>
                  <Input
                    id="clientID"
                    placeholder="Client Id"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="clientID"
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    placeholder="Client Name"
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Phone No</FormLabel>
                <FormControl>
                  <Input
                    id="phone"
                    placeholder="+1 XXXXXXXXX"
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
                <FormLabel>Email Id</FormLabel>
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
          <FormField
            control={form.control}
            name="properties"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Properties</FormLabel>
                <MultiSelect
                  onOpen={(state) => handleOnOpen(state)}
                  options={unAssignedProperties}
                  onValueChange={(value) => field.onChange(value)}
                  placeholder="Select"
                  variant="inverted"
                  animation={2}
                  loading={optionsLoading}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input
                    id="username"
                    placeholder="User Name"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    type="password"
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

            <Button className="!mt-3" disabled={isLoading}>
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
