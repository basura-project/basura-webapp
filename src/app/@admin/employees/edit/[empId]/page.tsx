"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { getEmployeeDetails } from "@/services/index";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { addEmployee } from "@/services/index";

export default function EditEmployee({ params: { empId } }: any) {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isError, setIsError] = React.useState<string>("");
  const [empDetails, setEmpDetails] = React.useState<any>({});
  const { toast } = useToast();
  const { setValue } = useForm();

  const formSchema = z
    .object({
      employeeId: z
        .string()
        .min(1, { message: "Please enter Employee Id" })
        .max(50),
      firstName: z
        .string()
        .min(1, { message: "Please enter first name" })
        .max(50),
      middleName: z.string(),
      lastName: z
        .string()
        .min(1, { message: "Please enter last name" })
        .max(50),
      contact: z
        .string()
        .min(1, { message: "Please enter contact number" })
        .max(50),
      email: z
        .string()
        .min(1, { message: "Please enter email" })
        .email("This is not a valid email."),
      bankAccountNo: z
        .string()
        .min(1, { message: "Please enter bank account number" })
        .max(50),
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
      employeeId: empDetails.employee_id,
      firstName: "",
      middleName: "",
      lastName: "",
      contact: "",
      email: "",
      bankAccountNo: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIsError("");

    try {
      let employeeDetails = {
        employee_id: values.employeeId,
        firstname: values.firstName,
        middlename: values.middleName,
        lastname: values.lastName,
        contact: values.contact,
        email: values.email,
        bank_account_no: values.bankAccountNo,
        username: values.username,
        password: values.password,
        role: "employee",
      };
      let res = await addEmployee(employeeDetails);
      if (res) {
        toast({
          title: "Successful",
          description: "Employee has been created successfully",
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

  React.useEffect(() => {
    (async () => {
      try {
        let res = await getEmployeeDetails(empId);
        if (res.data) {
          setEmpDetails(res.data);
          setValue("employeeId", "fd");
        }
        setIsLoading(false);
        setIsError("");
      } catch (e: any) {
        setIsLoading(false);
        setIsError(e.response.message);
        console.log(e);
      }
    })();
  }, [isLoading]);

  return (
    <div className="grid gap-2">
      <Breadcrumb className="hidden md:flex -mt-[68px] z-50">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/employees">Employees</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit #{empId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card x-chunk="dashboard-05-chunk-3">
        <div className="hidden space-y-2 p-6 pb-16 md:block">
          <div className="space-y-0.5">
            <h2 className="text-xl font-semibold tracking-tight">
              Edit Employee
            </h2>
          </div>
          <Separator className="my-6" />
          {isLoading ? "loading" : ""}
          {!isLoading && isError == "" ? (
            <div className="grid gap-2 lg:max-w-sm">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-2"
                >
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Id</FormLabel>
                        <FormControl>
                          <Input
                            id="employeeId"
                            placeholder="Employee Id"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="employeeId"
                            autoCorrect="off"
                            disabled={true}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            id="firstName"
                            placeholder="First Name"
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
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input
                            id="middleName"
                            placeholder="Middle Name"
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
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            id="lastName"
                            placeholder="Last Name"
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
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <FormControl>
                          <Input
                            id="contact"
                            placeholder="Contact"
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
                  <FormField
                    control={form.control}
                    name="bankAccountNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Account No</FormLabel>
                        <FormControl>
                          <Input
                            id="bankAccountNo"
                            placeholder="Bank Account No"
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
                  <Button
                    onClick={() => clearForm()}
                    variant="outline"
                    className="!mt-3 mr-3"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Clear
                  </Button>

                  <Button className="!mt-3" disabled={isLoading}>
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit
                  </Button>
                </form>
              </Form>
            </div>
          ) : (
            ""
          )}
        </div>
        {isError !== "" && !isLoading && (
          <p className="text-[0.8rem] font-medium text-destructive">
            {isError}
          </p>
        )}
      </Card>
    </div>
  );
}
