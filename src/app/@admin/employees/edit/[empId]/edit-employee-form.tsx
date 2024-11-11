"use client";

import * as React from "react";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { editEmployee } from "@/services/index";

export default function EditEmployee({ empDetails }: any) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<string>("");

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
      secondaryEmail: z
        .string()
        .min(1, { message: "Please enter secondary email" })
        .email("This is not a valid email."),
      bankAccountNo: z
        .string()
        .min(1, { message: "Please enter bank account number" })
        .max(50),
      routingNo: z
        .string()
        .min(1, { message: "Please enter routing number" })
        .max(50),
      swiftCode: z
        .string()
        .min(1, { message: "Please enter swift code" })
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
      firstName: empDetails.name.firstname,
      middleName: empDetails.name.middlename,
      lastName: empDetails.name.lastname,
      contact: empDetails.contact,
      email: empDetails.email,
      secondaryEmail: empDetails.secondary_email,
      bankAccountNo: empDetails.bank_account_no,
      routingNo: empDetails.routing_no,
      swiftCode: empDetails.swift_code,
      username: empDetails.username,
    },
  });

  async function onSubmit() {
    let values = form.getValues();
    setIsLoading(true);
    setIsError("");

    try {
      let employeeDetails = {
        name: {
          firstname: values.firstName,
          middlename: values.middleName,
          lastname: values.lastName,
        },
        contact: values.contact,
        email: values.email,
        bank_account_no: values.bankAccountNo,
        role: "employee",
      };
      let res = await editEmployee(empDetails.employee_id, employeeDetails);
      if (res) {
        toast({
          title: "Successful",
          description: "Employee details submitted successfully",
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
          name="secondaryEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="SecondaryEmail">Secondary Email</FormLabel>
              <FormControl>
                <Input
                  id="SecondaryEmail"
                  placeholder="Secondary Email"
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
          name="routingNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="RoutingNo">Routing No</FormLabel>
              <FormControl>
                <Input
                  id="RoutingNo"
                  placeholder="Routing No"
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
          name="swiftCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="SwiftCode">Swift Code</FormLabel>
              <FormControl>
                <Input
                  id="SwiftCode"
                  placeholder="Swift Code "
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
        <Button
          onClick={() => clearForm()}
          variant="outline"
          className="!mt-3 mr-3"
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Clear
        </Button>

        <Button
          onClick={() => onSubmit()}
          className="!mt-3"
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
